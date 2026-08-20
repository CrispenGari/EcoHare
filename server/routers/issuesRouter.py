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

    raw_token, token_hash = create_tracking_token()

    report = Report(
        public_reference=create_public_reference(),
        tracking_token_hash=token_hash,
        category=IssueType.DUMPED_WASTE,
        latitude=-32.7861234,
        longitude=26.8465678,
    )

    db.add(report)
    db.commit()
    db.refresh(report)
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
