from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.project import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    return service.create_project(payload)

@router.get("", response_model=List[ProjectResponse], status_code=status.HTTP_200_OK)
def list_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    return service.list_projects(skip=skip, limit=limit)

@router.get("/{project_id}", response_model=ProjectResponse, status_code=status.HTTP_200_OK)
def get_project(
    project_id: str,
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    return service.get_project(project_id)

@router.put("/{project_id}", response_model=ProjectResponse, status_code=status.HTTP_200_OK)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    return service.update_project(project_id, payload)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    service.delete_project(project_id)
    return None
