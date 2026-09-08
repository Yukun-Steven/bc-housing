#React / Next.js      FastAPI    SQLAlchemy    Database

    
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import properties, zealty

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BC Housing API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(properties.router)
app.include_router(zealty.router)

@app.get("/")
def root():
    return {
        "message": "BC Housing API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }