import os
import sys
from pathlib import Path
from dotenv import load_dotenv

root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))
env_file = root_dir / '.env'
load_dotenv(env_file)

from app.index import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.index:app", host="0.0.0.0", port=8000, reload=True)
