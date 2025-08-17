import strawberry
from typing import List, Optional
from bson import ObjectId
from app.database import books_collection

# ---------- TYPES ----------
@strawberry.type
class Book:
    id: str
    title: str
    author: str
    publishedYear: int
    genre: str
    state: str

@strawberry.type
class Author:
    name: str
    books: List[Book]

@strawberry.type
class Stats:
    totalBooks: int
    damagedBooks: int

# ---------- HELPERS ----------
def book_helper(book) -> Book:
    return Book(
        id=str(book["_id"]),
        title=book["title"],
        author=book["author"],
        publishedYear=book["publishedYear"],
        genre=book["genre"],
        state=book["state"],
    )

# ---------- QUERIES ----------
@strawberry.type
class Query:
    @strawberry.field
    def books(self) -> List[Book]:
        docs = books_collection.find()
        return [book_helper(b) for b in docs]

    @strawberry.field
    def book_by_id(self, id: str) -> Optional[Book]:
        doc = books_collection.find_one({"_id": ObjectId(id)})
        return book_helper(doc) if doc else None

    @strawberry.field
    def stats(self) -> Stats:
        total = books_collection.count_documents({})
        damaged = books_collection.count_documents({"state": "damaged"})
        return Stats(totalBooks=total, damagedBooks=damaged)

# ---------- SCHEMA ----------
schema = strawberry.Schema(query=Query)
