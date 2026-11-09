from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

router = APIRouter()
UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_UPLOAD_BYTES = 20 * 1024 * 1024

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=10000)

@router.get("/health")
def health():
    return {"status": "ok", "indexing_enabled": False}

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    original_name = Path(file.filename or "").name
    if not original_name.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported in this phase.")
    content = await file.read(MAX_UPLOAD_BYTES + 1)
    await file.close()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Maximum file size is 20 MB.")
    if not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="Invalid PDF file.")
    document_id = str(uuid4())
    destination = UPLOAD_DIR / f"{document_id}.pdf"
    destination.write_bytes(content)
    return {"status": "uploaded", "document_id": document_id, "filename": original_name, "message": "Upload successful. Indexing is not enabled yet."}

@router.post("/chat")
def chat(request: ChatRequest):
    return {"role": "assistant", "message": "Your message was received. Document retrieval and answer generation will be implemented in the next phase.", "status": "not_implemented"}
