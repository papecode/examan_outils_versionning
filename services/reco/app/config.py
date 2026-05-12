import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MODEL_PATH = os.getenv("MODEL_PATH", "/app/models/model.pkl")
    BOOKS_SERVICE_URL = os.getenv("BOOKS_SERVICE_URL", "http://livres:8001")
    DATA_PATH = os.getenv("DATA_PATH", "/app/data/loans_clean.csv")
    MODEL_REPO_PATH = os.getenv("MODEL_REPO_PATH", "/app/models")
