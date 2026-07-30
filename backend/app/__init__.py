from fastapi import FastAPI

def create_app() -> FastAPI:
    app = FastAPI(
        title="PSPIN API",
        description="Patient Sovereign Prescription Intelligence Network API",
        version="1.0.0",
    )

    @app.get("/")
    def root():
        return {
            "message": "PSPIN API is running",
            "status": "success",
        }

    @app.get("/health")
    def health_check():
        return {
            "status": "healthy",
        }

    return app