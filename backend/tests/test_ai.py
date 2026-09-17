import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.ai_service import clean_json_response, generate_mock_composition_spec
from app.schemas.ai import AICompositionRequest

client = TestClient(app)

def test_clean_json_response():
    raw_markdown = '```json\n{"title": "Test", "key": "Am"}\n```'
    cleaned = clean_json_response(raw_markdown)
    assert cleaned == '{"title": "Test", "key": "Am"}'

    raw_with_prose = 'Here is your composition:\n{"title": "Prose", "key": "C"}\nHope you enjoy!'
    cleaned_prose = clean_json_response(raw_with_prose)
    assert cleaned_prose == '{"title": "Prose", "key": "C"}'

def test_compose_music_endpoint_valid():
    response = client.post(
        "/api/ai/compose",
        json={
            "prompt": "Create a calm cinematic piano progression in A minor.",
            "key": "A",
            "scale": "Minor",
            "tempo": 85,
            "bars": 8,
            "seed": 12345
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    comp = data["composition"]
    assert comp["key"] == "A"
    assert comp["mode"] == "Minor"
    assert comp["tempo"] == 85
    assert len(comp["tracks"]) > 0
    assert len(comp["progression"]["chords"]) > 0

def test_compose_music_endpoint_empty_prompt():
    response = client.post(
        "/api/ai/compose",
        json={"prompt": "   "}
    )
    assert response.status_code == 400
    assert "Prompt cannot be empty" in response.json()["detail"]

def test_mock_composition_generator_determinism():
    req1 = AICompositionRequest(prompt="Pop tune", seed=999)
    req2 = AICompositionRequest(prompt="Pop tune", seed=999)
    res1 = generate_mock_composition_spec(req1)
    res2 = generate_mock_composition_spec(req2)
    assert res1 == res2

def test_analyze_production_endpoint_valid():
    response = client.post(
        "/api/ai/production/analyze",
        json={
            "context": {
                "projectSettings": {"title": "Test Project", "bpm": 120, "key": "C", "scale": "Major", "totalBars": 32},
                "tracks": [{"id": "t1", "name": "Piano", "instrument": "Piano"}],
                "arrangement": [],
                "mixerAnalysis": {},
                "musicalAnalysis": {"totalNotes": 40},
                "automationAnalysis": {"laneCount": 0, "pointCount": 0}
            },
            "mode": "analyze"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    analysis = data["analysis"]
    assert "summary" in analysis
    assert "observations" in analysis
    assert "findings" in analysis
    assert "suggestions" in analysis

