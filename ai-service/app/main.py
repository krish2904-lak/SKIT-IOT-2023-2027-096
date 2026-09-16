from fastapi import FastAPI

app = FastAPI(
    title="F-096 AI Service",
    description="AI service for technology stack recommendation",
    version="1.0.0",
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}
