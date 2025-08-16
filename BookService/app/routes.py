from fastapi import APIRouter, HTTPException, Query, Depends
from app.models import Book, BookCreate, BookUpdate
from app.database import books_collection
from bson import ObjectId
from app.auth import verify_token  # JWT token verifier
import requests  # dodamo za klice HTTP


router = APIRouter()

COUNTER_SERVICE_URL = "https://counter-service-2-0.onrender.com/increment"

def book_helper(book) -> dict:
    return {
        "id": str(book["_id"]),
        "title": book["title"],
        "author": book["author"],
        "publishedYear": book["publishedYear"],
        "genre": book["genre"],
        "state": book["state"]
    }

# POST /books
@router.post("/", response_model=Book, summary="Add a new book", responses={
    200: {"description": "Book added successfully"},
    400: {"description": "Invalid input"},
    401: {"description": "Unauthorized"}
})
def add_book(book: BookCreate, token: dict = Depends(verify_token)):
    """
    Adds a single book to the database.

    Only users with role 'user' or 'admin' can add books.

    - **title**: title of the book
    - **author**: book author
    - **publishedYear**: year of publication
    - **genre**: genre of the book
    - **state**: condition ('unharmed' or 'damaged')
    """
    if token["role"] not in ["user", "admin"]:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    book_dict = book.dict()
    result = books_collection.insert_one(book_dict)
    book_dict["id"] = str(result.inserted_id)
    return book_dict

# POST /books/bulk
@router.post("/bulk", response_model=list[Book], summary="Add multiple books at once")
def add_books_bulk(books: list[BookCreate], token: dict = Depends(verify_token)):
    """
    Adds multiple books to the database.

    Only users with role 'user' or 'admin' can add books.
    """
    if token["role"] not in ["user", "admin"]:
        raise HTTPException(status_code=401, detail="Unauthorized")

    book_dicts = [b.dict() for b in books]
    result = books_collection.insert_many(book_dicts)
    for i, b in enumerate(book_dicts):
        b["id"] = str(result.inserted_ids[i])
    return book_dicts

# GET /books
@router.get("/", response_model=list[Book], summary="Retrieve all books")
def get_books():
    """
    Returns a list of all books in the database.
    """
    books = [book_helper(b) for b in books_collection.find()]
    return books

# GET /books/{id}
@router.get("/{book_id}", response_model=Book, summary="Get a single book by ID", responses={404: {"description": "Book not found"}})
def get_book(book_id: str):
    """
    Returns a book by its ID and increments the counter in the counter-service.
    """
    book = books_collection.find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Klic counter-service
    try:
        resp = requests.post(COUNTER_SERVICE_URL, json={"value": 1}, timeout=3)
        if resp.status_code != 200:
            print(f"Counter service returned {resp.status_code}: {resp.text}")
    except requests.RequestException as e:
        print(f"Error calling counter service: {e}")
    return book_helper(book)

# PUT /books/{id}
@router.put("/{book_id}", summary="Update a book by ID", responses={
    200: {"description": "Book updated successfully"},
    400: {"description": "No fields to update"},
    404: {"description": "Book not found"}
})
def update_book(book_id: str, book: BookUpdate, token: dict = Depends(verify_token)):
    """
    Updates book fields partially.

    Both admins and regular users can update books.
    """
    update_data = {k: v for k, v in book.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Optional: če želiš omejiti, da običajni uporabniki ne spreminjajo 'state'
    if token["role"] != "admin" and "state" in update_data:
        del update_data["state"]

    result = books_collection.update_one({"_id": ObjectId(book_id)}, {"$set": update_data})
    if result.matched_count:
        return {"message": "Book updated"}
    raise HTTPException(status_code=404, detail="Book not found")


# PUT /books/{id}/state
@router.put("/{book_id}/state", summary="Update state of a book", responses={
    200: {"description": "Book state updated successfully"},
    400: {"description": "Invalid state"},
    404: {"description": "Book not found"},
    401: {"description": "Unauthorized"}
})
def update_book_state(book_id: str, state: str = Query(..., description="State must be 'unharmed' or 'damaged'", example="damaged"), token: dict = Depends(verify_token)):
    """
    Updates the state of a book.

    Only admins can update book state.
    """
    if token["role"] != "admin":
        raise HTTPException(status_code=401, detail="Admin privileges required")

    if state not in ["unharmed", "damaged"]:
        raise HTTPException(status_code=400, detail="State must be 'unharmed' or 'damaged'")
    result = books_collection.update_one({"_id": ObjectId(book_id)}, {"$set": {"state": state}})
    if result.matched_count:
        return {"message": "Book state updated"}
    raise HTTPException(status_code=404, detail="Book not found")

# DELETE /books/damaged
@router.delete("/damaged", summary="Delete all damaged books", responses={200: {"description": "Number of deleted books"}, 401: {"description": "Unauthorized"}})
def delete_damaged_books(token: dict = Depends(verify_token)):
    """
    Deletes all damaged books.

    Only admins can delete books.
    """
    if token["role"] != "admin":
        raise HTTPException(status_code=401, detail="Admin privileges required")
    
    result = books_collection.delete_many({"state": "damaged"})
    return {"deleted_count": result.deleted_count}

# DELETE /books/{id}
@router.delete("/{book_id}", summary="Delete a book by ID", responses={200: {"description": "Book deleted"}, 404: {"description": "Book not found"}, 401: {"description": "Unauthorized"}})
def delete_book(book_id: str, token: dict = Depends(verify_token)):
    """
    Deletes a single book by ID.

    Only admins can delete books.
    """
    if token["role"] != "admin":
        raise HTTPException(status_code=401, detail="Admin privileges required")
    
    result = books_collection.delete_one({"_id": ObjectId(book_id)})
    if result.deleted_count:
        return {"message": "Book deleted"}
    raise HTTPException(status_code=404, detail="Book not found")
