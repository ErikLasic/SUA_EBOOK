from pydantic import BaseModel, Field
from typing import Optional, List

class RecommendationBase(BaseModel):
    bookId: str = Field(..., example="650b8a1e3f1a2c0012345678")
    score: Optional[float] = Field(None, example=4.5)  # score je lahko None, ker nekatere preporočila nimajo ocene

class UserSettings(BaseModel):
    genres: Optional[List[str]] = Field(None, example=["Novel", "Science Fiction"])
    notify: Optional[bool] = Field(True, description="Enable notifications")

class RecommendationResponse(BaseModel):
    userId: str
    recommendations: List[RecommendationBase]
