from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/api")

# Pydantic models for request/response
class SimpleRequest(BaseModel):
    message: str
    timestamp: Optional[datetime] = None

class SimpleResponse(BaseModel):
    message: str
    echo: str
    timestamp: datetime

# Simple endpoint for testing
@router.post("/echo", response_model=SimpleResponse)
async def echo_message(request: SimpleRequest):
    try:
        return {
            "message": "Echo service is working!",
            "echo": request.message,
            "timestamp": datetime.now()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {str(e)}"
        )

# Health check endpoint
@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "FastAPI Server", "timestamp": datetime.now()}
