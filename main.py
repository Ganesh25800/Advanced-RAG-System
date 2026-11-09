from pathlib import Path
import uvicorn
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from api import router

BASE_DIR = Path(__file__).resolve().parent
app = FastAPI(title="Advanced RAG", version="0.1.0")
app.include_router(router, prefix="/api")
app.mount("/static", StaticFiles(directory=BASE_DIR / "frontend"), name="static")

@app.get("/", include_in_schema=False)
def index():
    return FileResponse(BASE_DIR / "frontend" / "index.html")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
