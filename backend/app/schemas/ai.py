from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class TimeSignatureSchema(BaseModel):
    numerator: int = Field(default=4, ge=1, le=16)
    denominator: int = Field(default=4, ge=1, le=16)

class SectionSchema(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Intro"})
    type: str = Field(default="verse", json_schema_extra={"example": "intro"})
    startBar: int = Field(..., ge=0)
    endBar: int = Field(..., ge=1)

class ChordItemSchema(BaseModel):
    root: str = Field(..., json_schema_extra={"example": "A"})
    quality: str = Field(default="minor", json_schema_extra={"example": "minor"})
    durationBars: float = Field(default=1.0, gt=0)
    romanNumeral: Optional[str] = Field(None, json_schema_extra={"example": "vi"})

class ProgressionSchema(BaseModel):
    template: Optional[str] = Field(None, json_schema_extra={"example": "vi-IV-I-V"})
    chords: List[ChordItemSchema] = Field(default_factory=list)

class TrackSpecSchema(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Piano"})
    role: Literal["chords", "melody", "arpeggio", "bass"] = Field(..., json_schema_extra={"example": "chords"})
    generator: Literal["chord", "melody", "arpeggio"] = Field(..., json_schema_extra={"example": "chord"})
    instrument: Optional[str] = Field(default="Piano")
    octaveOffset: Optional[int] = Field(default=0)
    noteDensity: Optional[Literal["low", "medium", "high"]] = Field(default="medium")
    pattern: Optional[Literal["Up", "Down", "UpDown", "Random"]] = Field(default="Up")

class PitchRangeSchema(BaseModel):
    min: int = Field(default=48, ge=0, le=127)
    max: int = Field(default=84, ge=0, le=127)

class GenerationSpecSchema(BaseModel):
    melodyDensity: Optional[Literal["low", "medium", "high"]] = Field(default="medium")
    pitchRange: Optional[PitchRangeSchema] = Field(default_factory=PitchRangeSchema)
    seed: int = Field(default=12345)

class AICompositionResponseSchema(BaseModel):
    title: str = Field(..., json_schema_extra={"example": "Dark Cinematic"})
    key: str = Field(default="C", json_schema_extra={"example": "A"})
    mode: str = Field(default="Minor", json_schema_extra={"example": "minor"})
    tempo: int = Field(default=120, ge=20, le=300)
    timeSignature: TimeSignatureSchema = Field(default_factory=TimeSignatureSchema)
    sections: List[SectionSchema] = Field(default_factory=list)
    progression: ProgressionSchema = Field(default_factory=ProgressionSchema)
    tracks: List[TrackSpecSchema] = Field(default_factory=list)
    generation: GenerationSpecSchema = Field(default_factory=GenerationSpecSchema)

class AICompositionRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="Natural language prompt describing the musical idea")
    key: Optional[str] = None
    scale: Optional[str] = None
    bars: Optional[int] = Field(None, ge=1, le=128)
    tempo: Optional[int] = Field(None, ge=20, le=300)
    style: Optional[str] = None
    mood: Optional[str] = None
    complexity: Optional[Literal["simple", "moderate", "complex"]] = None
    instruments: Optional[List[str]] = None
    seed: Optional[int] = None
