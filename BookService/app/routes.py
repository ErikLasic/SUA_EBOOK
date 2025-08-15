from fastapi import APIRouter, HTTPException, Query
from app.models import Book, BookCreate, BookUpdate
from app.database import books_collection
from bson import ObjectId

router = APIRouter()

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
    400: {"description": "Invalid input"}
})
def add_book(book: BookCreate):
    """
    Adds a single book to the database.

    - **title**: title of the book
    - **author**: book author
    - **publishedYear**: year of publication
    - **genre**: genre of the book
    - **state**: condition ('unharmed' or 'damaged')
    """
    book_dict = book.dict()
    result = books_collection.insert_one(book_dict)
    book_dict["id"] = str(result.inserted_id)
    return book_dict

# POST /books/bulk
@router.post("/bulk", response_model=list[Book], summary="Add multiple books at once")
def add_books_bulk(books: list[BookCreate]):
    """
    Adds multiple books to the database.
    """
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
    Returns a book by its ID.
    """
    book = books_collection.find_one({"_id": ObjectId(book_id)})
    if book:
        return book_helper(book)
    raise HTTPException(status_code=404, detail="Book not found")

# PUT /books/{id}
@router.put("/{book_id}", summary="Update a book by ID", responses={
    200: {"description": "Book updated successfully"},
    400: {"description": "No fields to update"},
    404: {"description": "Book not found"}
})
def update_book(book_id: str, book: BookUpdate):
    """
    Updates book fields partially.
    """
    update_data = {k: v for k, v in book.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = books_collection.update_one({"_id": ObjectId(book_id)}, {"$set": update_data})
    if result.matched_count:
        return {"message": "Book updated"}
    raise HTTPException(status_code=404, detail="Book not found")

# PUT /books/{id}/state
@router.put("/{book_id}/state", summary="Update state of a book", responses={
    200: {"description": "Book state updated successfully"},
    400: {"description": "Invalid state"},
    404: {"description": "Book not found"}
})
def update_book_state(book_id: str, state: str = Query(..., description="State must be 'unharmed' or 'damaged'", example="damaged")):
    if state not in ["unharmed", "damaged"]:
        raise HTTPException(status_code=400, detail="State must be 'unharmed' or 'damaged'")
    result = books_collection.update_one({"_id": ObjectId(book_id)}, {"$set": {"state": state}})
    if result.matched_count:
        return {"message": "Book state updated"}
    raise HTTPException(status_code=404, detail="Book not found")

# DELETE /books/damaged
@router.delete("/damaged", summary="Delete all damaged books", responses={200: {"description": "Number of deleted books"}})
def delete_damaged_books():
    result = books_collection.delete_many({"state": "damaged"})
    return {"deleted_count": result.deleted_count}

# DELETE /books/{id}
@router.delete("/{book_id}", summary="Delete a book by ID", responses={200: {"description": "Book deleted"}, 404: {"description": "Book not found"}})
def delete_book(book_id: str):
    result = books_collection.delete_one({"_id": ObjectId(book_id)})
    if result.deleted_count:
        return {"message": "Book deleted"}
    raise HTTPException(status_code=404, detail="Book not found")
