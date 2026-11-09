# Advanced RAG — Frontend and API Foundation

## Run

```bash
cd Advanced_RAG
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
python main.py
```

Open http://127.0.0.1:8000.

## API
- `GET /api/health` — server status
- `POST /api/upload` — PDF multipart upload (20 MB maximum); stores a UUID-named PDF in `uploads/`
- `POST /api/chat` — accepts JSON `{ "message": "..." }` and returns a placeholder response

## Scope
This phase implements the interface, upload transport, local PDF storage, and chat transport. No ChromaDB indexing, PDF extraction, semantic retrieval, or LLM answers yet. Do not expose this development server to the public internet: authentication, rate limiting, document isolation, and production file-validation controls are not implemented.
