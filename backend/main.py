from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI(title="Genomics Suite Proxy")

# CORS - allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your frontend URL in production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health():
    return {"status": "ok", "service": "genomics-proxy"}

# NCBI BLAST Proxy
@app.post("/api/ncbi/blast")
async def blast_proxy(request: dict):
    sequence = request.get("sequence")
    if not sequence:
        raise HTTPException(status_code=400, detail="Missing sequence parameter")
        
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                "https://blast.ncbi.nlm.nih.gov/Blast.cgi",
                data={
                    "CMD": "Put",
                    "PROGRAM": request.get("program", "blastn"),
                    "DATABASE": request.get("database", "nt"),
                    "QUERY": sequence,
                    "FORMAT_TYPE": "JSON2"
                }
            )
            # Safe parsing
            rid = None
            if "RID = " in response.text:
                rid = response.text.split("RID = ")[1].split("\n")[0].strip()
            return {"rid": rid}
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"NCBI query failed: {str(e)}")

# NCBI Fetch Proxy
@app.post("/api/ncbi/fetch")
async def fetch_proxy(request: dict):
    accession = request.get("accession")
    if not accession:
        raise HTTPException(status_code=400, detail="Missing accession parameter")
        
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(
                "https://eutils.ncbi.nlm.nih.gov/efetch.fcgi",
                params={
                    "db": "nuccore",
                    "id": accession,
                    "rettype": "fasta",
                    "retmode": "text"
                }
            )
            return {"sequence": response.text}
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"E-utility fetch failed: {str(e)}")

# Gemini Proxy (fallback if browser CORS fails)
@app.post("/api/gemini/chat")
async def gemini_proxy(request: dict):
    prompt = request.get("prompt")
    api_key = request.get("apiKey")
    if not prompt or not api_key:
        raise HTTPException(status_code=400, detail="Missing prompt or apiKey parameters")
        
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
                params={"key": api_key},
                json={"contents": [{"parts": [{"text": prompt}]}]}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Gemini API handshake failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
