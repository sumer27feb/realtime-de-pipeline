from fastapi import FastAPI

from api.routers.metrics import router as metrics_router

app = FastAPI(
    title="E-commerce Metrics API",
    version="1.0.0",
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(metrics_router)
