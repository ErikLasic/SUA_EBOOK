import strawberry
from typing import List, Optional
from bson import ObjectId
from app.database import recommendations_collection, user_settings_collection, loans_collection, books_collection

# ---------- TYPES ----------
@strawberry.type
class Recommendation:
    id: Optional[str]
    userId: Optional[str]
    bookId: str
    score: Optional[float]
    comment: Optional[str]

@strawberry.type
class Stats:
    totalRecommendations: int
    averageScore: float

# ---------- HELPERS ----------
def recommendation_helper(rec) -> Recommendation:
    return Recommendation(
        id=str(rec.get("_id")) if rec.get("_id") else None,
        userId=rec.get("userId"),
        bookId=rec.get("bookId"),
        score=float(rec.get("score")) if rec.get("score") is not None else None,
        comment=rec.get("comment")
    )

# ---------- QUERIES ----------
@strawberry.type
class Query:
    @strawberry.field
    def recommendations(self) -> List[Recommendation]:
        docs = recommendations_collection.find()
        return [recommendation_helper(r) for r in docs]

    @strawberry.field
    def recommendation_by_id(self, id: str) -> Optional[Recommendation]:
        try:
            doc = recommendations_collection.find_one({"_id": ObjectId(id)})
        except Exception:
            return None
        return recommendation_helper(doc) if doc else None

    @strawberry.field
    def stats(self) -> Stats:
        total = recommendations_collection.count_documents({})
        avg_score_doc = recommendations_collection.aggregate([
            {"$group": {"_id": None, "avgScore": {"$avg": "$score"}}}
        ])
        avg_score = 0
        for doc in avg_score_doc:
            avg_score = float(doc.get("avgScore", 0))
        return Stats(totalRecommendations=total, averageScore=avg_score)

    @strawberry.field
    def top_recommendations(self, limit: int = 20) -> List[Recommendation]:
        docs = recommendations_collection.find().sort("score", -1).limit(limit)
        return [recommendation_helper(r) for r in docs]

    # ---------- SCHEMA ----------
schema = strawberry.Schema(query=Query)
