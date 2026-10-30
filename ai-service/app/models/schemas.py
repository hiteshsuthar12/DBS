from pydantic import BaseModel, Field
from typing import List, Optional

class DemandDataPoint(BaseModel):
    date: str
    quantity: float

class ProductPredictionInput(BaseModel):
    product_id: int
    name: str
    sku: str
    current_stock: int
    minimum_stock_level: int = 10
    maximum_stock_level: int = 500
    reorder_level: int = 20
    lead_time_days: int = 7
    demand_history: List[DemandDataPoint] = Field(default_factory=list)
    horizon_days: Optional[int] = 15

class StockOutPredictionOutput(BaseModel):
    productId: int
    productName: str
    sku: str
    currentStock: int
    averageDailyDemand: float
    predictedStockOutDate: str
    estimatedDaysRemaining: int
    confidenceScore: float
    riskLevel: str
    isBaseline: bool
    explanation: str

class ReorderRecommendationOutput(BaseModel):
    productId: int
    productName: str
    sku: str
    currentStock: int
    reorderLevel: int
    recommendedReorderQuantity: int
    leadTimeDays: int
    safetyStock: float
    targetInventoryLevel: float
    explanation: str

class DemandForecastOutput(BaseModel):
    productId: int
    productName: str
    sku: str
    horizonDays: int
    historicalDemand: List[DemandDataPoint]
    forecastedDemand: List[DemandDataPoint]
    modelType: str
    accuracyMetric: str

class RiskClassificationOutput(BaseModel):
    productId: int
    productName: str
    sku: str
    currentStock: int
    riskLevel: str
    riskFactors: List[str]
    actionRecommendation: str

