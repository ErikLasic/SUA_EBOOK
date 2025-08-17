from fastapi import APIRouter, HTTPException, Depends, Query
from app.models import RecommendationBase, UserSettings, RecommendationResponse
from app.database import recommendations_collection, user_settings_collection, loans_collection, books_collection
from app.auth import verify_token, verify_admin
from typing import List
from datetime import datetime, timedelta
from bson import ObjectId, errors
import requests

router = APIRouter()

def validate_objectid(id_str: str):
    try:
        return ObjectId(id_str)
    except errors.InvalidId:
        raise HTTPException(status_code=400, detail=f"Invalid ObjectId: {id_str}")

@router.post("/train", summary="Update global recommendation model", description="Train/update the global recommendation model. Admin only.")
def train_global_model(token: dict = Depends(verify_admin)):
    # --- Posodobi globalni recommendation model ---
    pipeline = [
        {"$match": {"status": {"$in": ["active", "returned"]}}},
        {"$group": {"_id": "$bookId", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 20}
    ]
    popular_books = list(loans_collection.aggregate(pipeline))
    now = datetime.utcnow()
    for book in popular_books:
        recommendations_collection.update_one(
            {"bookId": book["_id"]},
            {"$set": {"score": book["count"], "updatedAt": now}},
            upsert=True
        )

    # --- Klic serverless funkcije (za pošiljanje emaila) ---
    try:
        email_api_url = "https://email-service-ten-rust.vercel.app/api/send-email"
        response = requests.post(email_api_url, timeout=5)
        response.raise_for_status()
        print(f"Email poslan, status: {response.json()}")
    except requests.RequestException as e:
        print(f"Napaka pri klicu serverless funkcije: {e}")

    return {"message": "Global recommendation model updated", "updated": len(popular_books)}

@router.post("/user/{userId}/settings", summary="Set initial user settings")
def set_user_settings(userId: str, settings: UserSettings, token: dict = Depends(verify_token)):
    user_settings_collection.update_one({"userId": userId}, {"$set": settings.dict()}, upsert=True)
    return {"message": "User settings saved"}


@router.get("/{userId}", response_model=RecommendationResponse, summary="Get personalized recommendations")
def get_user_recommendations(userId: str, token: dict = Depends(verify_token)):
    user_settings = user_settings_collection.find_one({"userId": userId}) or {}
    preferred_genres = user_settings.get("genres", [])

    loans = list(loans_collection.find({"userId": userId, "status": {"$in": ["active", "returned"]}}))
    if not loans:
        top_recs = list(recommendations_collection.find().sort("score", -1).limit(5))
        return {"userId": userId, "recommendations": [{"bookId": r["bookId"], "score": r.get("score")} for r in top_recs]}

    borrowed_book_ids = [validate_objectid(loan["bookId"]) for loan in loans if "bookId" in loan]
    borrowed_books = list(books_collection.find({"_id": {"$in": borrowed_book_ids}}))
    authors = {book.get("author") for book in borrowed_books if book.get("author")}
    genres = {book.get("genre") for book in borrowed_books if book.get("genre")}

    query = {"_id": {"$nin": borrowed_book_ids}, "$or": []}
    if authors:
        query["$or"].append({"author": {"$in": list(authors)}})
    if genres:
        query["$or"].append({"genre": {"$in": list(genres)}})

    recs = list(books_collection.find(query)) if query["$or"] else []
    if preferred_genres:
        recs.sort(key=lambda b: preferred_genres.index(b.get("genre").lower()) if b.get("genre") else len(preferred_genres))
    return {"userId": userId, "recommendations": [{"bookId": str(r["_id"]), "score": None} for r in recs[:5]]}


@router.get("/top", response_model=List[RecommendationBase], summary="Get top global recommendations")
def get_top_recommendations(limit: int = Query(20, description="Number of top recommendations to retrieve")):
    recs = list(recommendations_collection.find().sort("score", -1).limit(limit))
    return [{"bookId": r["bookId"], "score": r["score"]} for r in recs]


@router.put("/user/{userId}/settings", summary="Update user settings")
def update_user_settings(userId: str, settings: UserSettings, token: dict = Depends(verify_token)):
    update_data = settings.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")
    result = user_settings_collection.update_one({"userId": userId}, {"$set": update_data}, upsert=False)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User settings updated"}


@router.put("/user/{userId}/notify", summary="Toggle notifications")
def toggle_user_notify(userId: str, notify: bool = Query(...), token: dict = Depends(verify_token)):
    result = user_settings_collection.update_one({"userId": userId}, {"$set": {"notify": notify}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"Notifications {'enabled' if notify else 'disabled'}"}


@router.delete("/user/{userId}/reset", summary="Reset user settings")
def reset_user_recommendations(userId: str, token: dict = Depends(verify_token)):
    now = datetime.utcnow()
    user_settings_collection.update_one({"userId": userId}, {"$set": {"last_recommendation_date": now, "genres": [], "notify": False}}, upsert=True)
    recommendations_collection.delete_many({"userId": userId})
    return {"message": "User settings reset", "last_reset": now}


@router.delete("/obsolete", summary="Delete obsolete global recommendations")
def delete_obsolete_recommendations(token: dict = Depends(verify_admin)):
    one_year_ago = datetime.utcnow() - timedelta(days=365)
    recent_loans = loans_collection.distinct("bookId", {"loanDate": {"$gte": one_year_ago}})
    result = recommendations_collection.delete_many({"bookId": {"$nin": recent_loans}})
    return {"message": "Obsolete recommendations deleted", "deleted_count": result.deleted_count}
