from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.project import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.models.project import Project

class ProjectService:
    def __init__(self, db: Session):
        self.repository = ProjectRepository(db)

    def list_projects(self, skip: int = 0, limit: int = 100) -> List[ProjectResponse]:
        projects = self.repository.get_all(skip=skip, limit=limit)
        return [ProjectResponse.model_validate(p) for p in projects]

    def get_project(self, project_id: str) -> ProjectResponse:
        project = self.repository.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID '{project_id}' not found."
            )
        return ProjectResponse.model_validate(project)

    def create_project(self, payload: ProjectCreate) -> ProjectResponse:
        db_project = self.repository.create(payload)
        return ProjectResponse.model_validate(db_project)

    def update_project(self, project_id: str, payload: ProjectUpdate) -> ProjectResponse:
        project = self.repository.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID '{project_id}' not found."
            )
        updated_project = self.repository.update(project, payload)
        return ProjectResponse.model_validate(updated_project)

    def delete_project(self, project_id: str) -> None:
        project = self.repository.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID '{project_id}' not found."
            )
        self.repository.delete(project)
