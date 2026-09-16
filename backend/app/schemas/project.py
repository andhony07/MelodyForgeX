from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Project name")
    description: Optional[str] = Field(None, max_length=1000, description="Project description")
    tempo: int = Field(120, description="Tempo in BPM")
    key: str = Field("C", max_length=10, description="Musical key signature")
    time_signature: str = Field("4/4", max_length=10, description="Time signature")

    @field_validator("tempo")
    @classmethod
    def validate_tempo(cls, v: int) -> int:
        if v < 20 or v > 300:
            raise ValueError("Tempo must be between 20 and 300 BPM")
        return v

    @field_validator("time_signature")
    @classmethod
    def validate_time_signature(cls, v: str) -> str:
        if not v or "/" not in v:
            raise ValueError("Time signature must be in format X/Y (e.g., 4/4, 3/4, 6/8)")
        return v

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    tempo: Optional[int] = Field(None)
    key: Optional[str] = Field(None, max_length=10)
    time_signature: Optional[str] = Field(None, max_length=10)

    @field_validator("tempo")
    @classmethod
    def validate_tempo(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 20 or v > 300):
            raise ValueError("Tempo must be between 20 and 300 BPM")
        return v

    @field_validator("time_signature")
    @classmethod
    def validate_time_signature(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and (not v or "/" not in v):
            raise ValueError("Time signature must be in format X/Y (e.g., 4/4, 3/4, 6/8)")
        return v

class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
