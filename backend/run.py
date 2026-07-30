from app import create_app

app = create_app()

# This file is now solely responsible for serving as the entry point for Uvicorn.
# Run using: uvicorn run:app --reload