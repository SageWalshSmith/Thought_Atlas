from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["thoughtatlas"]
summaries_collection = db["summaries"]