import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.session import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_melodyforge.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_project_lifecycle():
    # 1. Create project
    payload = {
        "name": "Synthwave Dream",
        "description": "Retro 80s synthwave track in A minor",
        "tempo": 128,
        "key": "Am",
        "time_signature": "4/4"
    }
    response = client.post("/api/projects", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["name"] == "Synthwave Dream"
    assert data["tempo"] == 128
    assert data["key"] == "Am"
    assert "id" in data
    project_id = data["id"]

    # 2. List projects
    response = client.get("/api/projects")
    assert response.status_code == 200
    list_data = response.json()
    assert len(list_data) == 1
    assert list_data[0]["id"] == project_id

    # 3. Get single project
    response = client.get(f"/api/projects/{project_id}")
    assert response.status_code == 200
    assert response.json()["id"] == project_id

    # 4. Update project
    update_payload = {
        "name": "Synthwave Dream (Remix)",
        "tempo": 132
    }
    response = client.put(f"/api/projects/{project_id}", json=update_payload)
    assert response.status_code == 200
    updated_data = response.json()
    assert updated_data["name"] == "Synthwave Dream (Remix)"
    assert updated_data["tempo"] == 132

    # 5. Delete project
    response = client.delete(f"/api/projects/{project_id}")
    assert response.status_code == 204

    # 6. Verify deletion
    response = client.get(f"/api/projects/{project_id}")
    assert response.status_code == 404

def test_project_validation_errors():
    # Invalid tempo (under 20)
    response = client.post("/api/projects", json={"name": "Bad Tempo", "tempo": 10})
    assert response.status_code == 422

    # Invalid time signature
    response = client.post("/api/projects", json={"name": "Bad TS", "time_signature": "invalid"})
    assert response.status_code == 422

def test_nonexistent_project_operations():
    fake_id = "nonexistent-uuid-1234"
    assert client.get(f"/api/projects/{fake_id}").status_code == 404
    assert client.put(f"/api/projects/{fake_id}", json={"name": "New"}).status_code == 404
    assert client.delete(f"/api/projects/{fake_id}").status_code == 404
