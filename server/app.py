import asyncio
import warnings
from contextlib import asynccontextmanager

from db import create_tables
from db.models import *
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from models import device
from routers.authRouter import authRouter
from routers.issuesRouter import issuesRouter
from torchvision import models

warnings.filterwarnings("ignore")


def download_add_cache_models():
    print(f"🖥️ --------------- Running the models on: {device} --------------- \n")
    print(" *  DOWNLOADING AND CACHING MODELS")
    models.mobilenet_v3_large(weights=False)
    print(" *  DONNE DOWNLOADING AND CACHING MODELS")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await asyncio.to_thread(create_tables)
    download_add_cache_models()
    yield

app = FastAPI(
    title="EcoHare AI API",
    description="API for an AI-assisted bilingual mobile platform for reporting, mapping and tracking dumped waste and visible water leaks at the University of Fort Hare Alice campus.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(authRouter)
app.include_router(
    issuesRouter
)
app.mount("/api/v1/ecohare/storage", StaticFiles(directory="storage"), name="storage")

@app.get("/")
def root():
    return JSONResponse(
        {
            "title": "EcoHare AI API",
            "description": "API for an AI-assisted bilingual mobile platform for reporting, mapping and tracking dumped waste and visible water leaks at the University of Fort Hare Alice campus.",
            "version": "1.0.0",
        },
        status_code=200,
    )

for route in app.routes:
    print(route)