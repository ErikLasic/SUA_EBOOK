from pydantic import BaseModel, Field
from typing import Optional

class BookBase(BaseModel):
    title: str = Field(..., example="The Great Gatsby", description="Title of the book")
    author: str = Field(..., example="F. Scott Fitzgerald", description="Author of the book")
    publishedYear: int = Field(..., example=1925, description="Year the book was published")
    genre: str = Field(..., example="Novel", description="Genre of the book")
    state: str = Field(..., example="unharmed", description="Condition of the book, can be 'unharmed' or 'damaged'")

class BookCreate(BookBase):
    pass

class Book(BookBase):
    id: str = Field(..., example="650b8a1e3f1a2c0012345678", description="MongoDB ObjectId of the book")
    created_by: str | None = Field(None, example="650b8a1e3f1a2c0012345678", description="User id who created the book")

class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, example="New title")
    author: Optional[str] = Field(None, example="New author")
    publishedYear: Optional[int] = Field(None, example=2020)
    genre: Optional[str] = Field(None, example="Science Fiction")
    state: Optional[str] = Field(None, example="damaged")
