from fastapi import FastAPI
from app.routes import router as book_router

app = FastAPI()
app.include_router(book_router, prefix="/books", tags=["books"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
