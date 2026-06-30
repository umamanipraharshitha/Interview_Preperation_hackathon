import os
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = "resumes"

# Include api_key only if it exists (required for cloud)
client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, check_compatibility=False)

def init_qdrant():
    try:
        collections = client.get_collections().collections
        if not any(c.name == COLLECTION_NAME for c in collections):
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=768, distance=Distance.COSINE), # Assuming 768 dim embeddings
            )
            print(f"Collection {COLLECTION_NAME} created.")
    except Exception as e:
        print(f"Failed to initialize Qdrant: {e}")

def store_embedding(resume_id: int, embedding: list[float], payload: dict):
    try:
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                PointStruct(
                    id=resume_id,
                    vector=embedding,
                    payload=payload
                )
            ]
        )
        return True
    except Exception as e:
        print(f"Error storing embedding: {e}")
        return False
