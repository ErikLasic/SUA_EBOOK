from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router as book_router
from strawberry.fastapi import GraphQLRouter
from app.graphql import schema

app = FastAPI()

# NOTE: Browser clients (your frontend) require CORS headers. During development
# allow the frontend origin or use '*' for convenience. If you know the exact
# frontend origin (e.g. http://localhost:3000) replace the list below.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] ,  # adjust to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(book_router, prefix="/books", tags=["books"])

# GraphQL API
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
