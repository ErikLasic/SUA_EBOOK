
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router as recommendation_router
from strawberry.fastapi import GraphQLRouter
from app.graphql import schema

app = FastAPI()

# Allow CORS from local frontend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(recommendation_router, prefix="/recommendations", tags=["recommendations"])

# GraphQL API
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
