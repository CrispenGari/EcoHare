from fastapi import APIRouter, File, Form
from fastapi.responses import JSONResponse
from typing import Annotated
import time
issuesRouter = APIRouter(prefix="/api/v1/issues")


issuesRouter.post("/new")
def new(
    image: Annotated[bytes, File()],
    explain: Annotated[bool, Form()] = False
):
    start = time.monotonic()
    try:
     
        return JSONResponse(
            {
                "time": time.monotonic() - start,
                "ok": True,
                "status": "ok",
              
                "id": str(uuid4())
                
            },
            status_code=200,
        )
    except Exception as e:
        JSONResponse(
            {
                "time": time.monotonic() - start,
                "ok": False,
                "field": "server",
                "status": "error",
                "message": "Internal Server Error.",
                "error": str(e)
            },
            status_code=500,
        )
