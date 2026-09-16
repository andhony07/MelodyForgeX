from fastapi import APIRouter, HTTPException, status
from app.schemas.ai import AICompositionRequest, AICompositionResponseSchema
from app.services.ai_service import generate_ai_composition

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post(
    "/compose",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Generate a structured AI composition specification"
)
async def compose_music(request: AICompositionRequest):
    """
    Receives natural language musical prompt and optional constraints,
    calls AI provider, validates schema, and returns structured composition JSON.
    """
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt cannot be empty"
        )
    
    try:
        composition_spec = await generate_ai_composition(request)
        return {
            "success": True,
            "composition": composition_spec.model_dump()
        }
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI composition failed: {str(err)}"
        )
