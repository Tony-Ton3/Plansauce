from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time
import uvicorn

app = FastAPI(
    title="LearnStack Python Service",
    description="API for LearnStack CrewAI integration",
    version="0.1.0"
)

# Add CORS middleware to allow requests from your Node.js server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set this to your specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify if the service is up"""
    return {
        "status": "healthy",
        "timestamp": time.time()
    }

# Echo endpoint
@app.post("/api/echo")
async def echo(request: Request):
    """Echo endpoint that returns the message sent to it"""
    data = await request.json()
    
    if not data or 'message' not in data:
        return {"error": "Message is required"}, 400
        
    return {
        "echo": data['message'],
        "timestamp": time.time()
    }

# CrewAI placeholder endpoint
@app.post("/api/crew-ai")
async def crew_ai(request: Request):
    """Placeholder for CrewAI functionality"""
    # This will be replaced with actual CrewAI implementation
    data = await request.json()
    query = data.get('query', 'No query provided')
    
    return {
        "success": True,
        "message": "CrewAI integration placeholder",
        "mockData": True,
        "timestamp": time.time(),
        "echo": query
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to LearnStack CrewAI API",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) # Run with: uvicorn main:app  --reload
