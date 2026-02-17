from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, images, credits

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FaceCensor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://facecensor.logge.top"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(images.router)
app.include_router(credits.router)


@app.get("/health")
def health():
    return {"status": "ok"}
