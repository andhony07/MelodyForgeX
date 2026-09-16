from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate

class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Project]:
        return (
            self.db.query(Project)
            .order_by(Project.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, project_id: str) -> Optional[Project]:
        return self.db.query(Project).filter(Project.id == project_id).first()

    def create(self, schema: ProjectCreate) -> Project:
        db_project = Project(
            name=schema.name,
            description=schema.description,
            tempo=schema.tempo,
            key=schema.key,
            time_signature=schema.time_signature,
        )
        self.db.add(db_project)
        self.db.commit()
        self.db.refresh(db_project)
        return db_project

    def update(self, project: Project, schema: ProjectUpdate) -> Project:
        update_data = schema.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(project, key, value)
        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project: Project) -> None:
        self.db.delete(project)
        self.db.commit()
