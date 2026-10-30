import pytest
from app.models.schemas import ProductPredictionInput, DemandDataPoint
from app.forecasting.engine import InventoryForecastingEngine
from app.api.routes import (
    predict_stock_out as api_predict_stock_out,
    recommend_reorder as api_recommend_reorder,
    forecast_demand as api_forecast_demand,
    classify_risk as api_classify_risk
)

@pytest.fixture
def sample_product_input():
    history = [
        DemandDataPoint(date=f"2026-10-{i:02d}", quantity=float(5 + (i % 3)))
        for i in range(1, 15)
    ]
    return ProductPredictionInput(
        product_id=1,
        name="Industrial Sensor X100",
        sku="IND-SEN-X100",
        current_stock=35,
        minimum_stock_level=10,
        maximum_stock_level=200,
        reorder_level=25,
        lead_time_days=7,
        demand_history=history,
        horizon_days=15
    )

def test_stock_out_prediction(sample_product_input):
    result = InventoryForecastingEngine.predict_stock_out(sample_product_input)
    assert result.productId == 1
    assert result.currentStock == 35
    assert result.averageDailyDemand > 0
    assert result.estimatedDaysRemaining > 0
    assert result.riskLevel in ["HEALTHY", "MEDIUM", "HIGH", "CRITICAL"]
    assert result.confidenceScore >= 0.70
    assert not result.isBaseline

def test_stock_out_zero_stock(sample_product_input):
    sample_product_input.current_stock = 0
    result = InventoryForecastingEngine.predict_stock_out(sample_product_input)
    assert result.currentStock == 0
    assert result.estimatedDaysRemaining == 0
    assert result.riskLevel == "CRITICAL"

def test_stock_out_insufficient_data():
    empty_input = ProductPredictionInput(
        product_id=2,
        name="New Product",
        sku="NEW-001",
        current_stock=20,
        demand_history=[]
    )
    result = InventoryForecastingEngine.predict_stock_out(empty_input)
    assert result.isBaseline is True
    assert result.confidenceScore == 0.65
    assert result.estimatedDaysRemaining >= 0

def test_reorder_recommendation(sample_product_input):
    result = InventoryForecastingEngine.recommend_reorder(sample_product_input)
    assert result.productId == 1
    assert result.leadTimeDays == 7
    assert result.safetyStock > 0
    assert "lead time" in result.explanation.lower()

def test_demand_forecast_horizons(sample_product_input):
    for horizon in [7, 15, 30]:
        sample_product_input.horizon_days = horizon
        result = InventoryForecastingEngine.forecast_demand(sample_product_input)
        assert result.horizonDays == horizon
        assert len(result.forecastedDemand) == horizon
        assert len(result.historicalDemand) > 0

def test_risk_classification(sample_product_input):
    # Test critical
    sample_product_input.current_stock = 3
    crit_result = InventoryForecastingEngine.classify_risk(sample_product_input)
    assert crit_result.riskLevel == "CRITICAL"

    # Test healthy
    sample_product_input.current_stock = 150
    healthy_result = InventoryForecastingEngine.classify_risk(sample_product_input)
    assert healthy_result.riskLevel == "HEALTHY"

def test_api_stock_out_route(sample_product_input):
    response = api_predict_stock_out(sample_product_input)
    assert response.productId == 1
    assert response.currentStock == 35
    assert response.estimatedDaysRemaining > 0

def test_api_reorder_route(sample_product_input):
    response = api_recommend_reorder(sample_product_input)
    assert response.productId == 1
    assert response.leadTimeDays == 7

def test_api_forecast_route(sample_product_input):
    response = api_forecast_demand(sample_product_input)
    assert response.productId == 1
    assert len(response.forecastedDemand) == 15

def test_api_classify_risk_route(sample_product_input):
    response = api_classify_risk(sample_product_input)
    assert response.productId == 1
    assert response.riskLevel in ["HEALTHY", "MEDIUM", "HIGH", "CRITICAL", "LOW_RISK"]
