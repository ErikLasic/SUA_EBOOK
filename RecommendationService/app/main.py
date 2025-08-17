from fastapi import FastAPI
from app.routes import router as recommendation_router
from strawberry.fastapi import GraphQLRouter
from app.graphql import schema

app = FastAPI()
app.include_router(recommendation_router, prefix="/recommendations", tags=["recommendations"])

# GraphQL API
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
