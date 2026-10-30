from fastapi import APIRouter
from app.models.schemas import (
    ProductPredictionInput,
    StockOutPredictionOutput,
    ReorderRecommendationOutput,
    DemandForecastOutput,
    RiskClassificationOutput
)
from app.forecasting.engine import InventoryForecastingEngine

router = APIRouter(prefix="/api/ai", tags=["AI Inventory Predictions"])

@router.post("/predict/stock-out", response_model=StockOutPredictionOutput)
def predict_stock_out(payload: ProductPredictionInput):
    return InventoryForecastingEngine.predict_stock_out(payload)

@router.post("/predict/reorder", response_model=ReorderRecommendationOutput)
def recommend_reorder(payload: ProductPredictionInput):
    return InventoryForecastingEngine.recommend_reorder(payload)

@router.post("/predict/demand-forecast", response_model=DemandForecastOutput)
def forecast_demand(payload: ProductPredictionInput):
    return InventoryForecastingEngine.forecast_demand(payload)

@router.post("/classify/risk", response_model=RiskClassificationOutput)
def classify_risk(payload: ProductPredictionInput):
    return InventoryForecastingEngine.classify_risk(payload)

