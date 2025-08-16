from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
recommendations_collection = db["recommendations"]
user_settings_collection = db["user_settings"]
loans_collection = client["loanservice"]["loans"]
books_collection = client["eBookProject"]["books"]