import os
import json
import re
import random
import httpx
from typing import Dict, Any
from app.schemas.ai import AICompositionRequest, AICompositionResponseSchema

SYSTEM_PROMPT = """You are the composition planner for MelodyForgeX, an AI Music Studio.
Your task is to transform the user's musical request into a structured composition specification.

Rules:
1. Return JSON only. Do not return markdown, code fences, or explanations.
2. Follow the schema strictly.
3. Use valid musical keys: C, C#, D, D#, E, F, F#, G, G#, A, A#, B.
4. Use valid scales/modes: Major, Minor, Dorian, Phrygian, Lydian, Mixolydian, Harmonic Minor, Melodic Minor.
5. Use supported chord qualities: major, minor, 7th, maj7, min7, dim, aug, sus2, sus4.
6. Use supported generator types: chord, melody, arpeggio.
7. Keep bars and timing valid.
8. Prefer existing Phase 5 composition primitives.
9. Do not generate raw MIDI note arrays (pitch/beat arrays).
10. Do not generate arbitrary JavaScript or code.
11. Do not return explanations outside the JSON.
12. Respect user constraints (key, mode, BPM, bars, seed).
13. If details are omitted, choose reasonable musically coherent defaults.
14. Always include a deterministic seed.

Schema format:
{
  "title": "String title",
  "key": "A",
  "mode": "Minor",
  "tempo": 90,
  "timeSignature": { "numerator": 4, "denominator": 4 },
  "sections": [
    { "name": "Intro", "type": "intro", "startBar": 1, "endBar": 4 },
    { "name": "Main", "type": "verse", "startBar": 5, "endBar": 12 }
  ],
  "progression": {
    "template": "vi-IV-I-V",
    "chords": [
      { "root": "A", "quality": "minor", "durationBars": 1, "romanNumeral": "vi" },
      { "root": "F", "quality": "major", "durationBars": 1, "romanNumeral": "IV" },
      { "root": "C", "quality": "major", "durationBars": 1, "romanNumeral": "I" },
      { "root": "G", "quality": "major", "durationBars": 1, "romanNumeral": "V" }
    ]
  },
  "tracks": [
    { "name": "AI Chords", "role": "chords", "generator": "chord", "instrument": "Piano", "octaveOffset": -1 },
    { "name": "AI Melody", "role": "melody", "generator": "melody", "instrument": "Synth", "octaveOffset": 0, "noteDensity": "medium" },
    { "name": "AI Arpeggio", "role": "arpeggio", "generator": "arpeggio", "instrument": "Guitar", "octaveOffset": 0, "pattern": "Up" }
  ],
  "generation": {
    "melodyDensity": "medium",
    "register": { "min": 48, "max": 84 },
    "seed": 12345
  }
}
"""

def clean_json_response(raw_text: str) -> str:
    """Strip markdown formatting or outer text around JSON."""
    text = raw_text.strip()
    # Remove markdown code blocks if present
    code_block_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if code_block_match:
        text = code_block_match.group(1).strip()
    # Find start '{' and end '}'
    start_idx = text.find('{')
    end_idx = text.rfind('}')
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        text = text[start_idx:end_idx + 1]
    return text

def generate_mock_composition_spec(request: AICompositionRequest) -> Dict[str, Any]:
    """Fallback generator when API key is missing or service unavailable."""
    prompt_lower = request.prompt.lower()
    
    # Determine key
    key = request.key or "C"
    if not request.key:
        for k in ["C#", "D#", "F#", "G#", "A#", "C", "D", "E", "F", "G", "A", "B"]:
            if k.lower() in prompt_lower:
                key = k
                break
                
    # Determine mode
    mode = request.scale or ("Minor" if "minor" in prompt_lower or "dark" in prompt_lower or "sad" in prompt_lower else "Major")
    
    # Determine tempo
    tempo = request.tempo or (80 if "calm" in prompt_lower or "slow" in prompt_lower or "cinematic" in prompt_lower else 120)
    
    # Seed
    seed = request.seed or random.randint(10000, 99999)
    total_bars = request.bars or 8

    # Title creation
    title = f"AI {mode} Idea"
    if "cinematic" in prompt_lower:
        title = "Cinematic Odyssey"
    elif "pop" in prompt_lower:
        title = "Pop Groove"
    elif "chill" in prompt_lower or "calm" in prompt_lower:
        title = "Calm Reflection"

    # Chords progression according to mode
    if mode == "Minor":
        chords = [
            {"root": key, "quality": "minor", "durationBars": 2, "romanNumeral": "i"},
            {"root": "F" if key == "A" else "F", "quality": "major", "durationBars": 2, "romanNumeral": "VI"},
            {"root": "C" if key == "A" else "C", "quality": "major", "durationBars": 2, "romanNumeral": "III"},
            {"root": "G" if key == "A" else "G", "quality": "major", "durationBars": 2, "romanNumeral": "VII"},
        ]
        template = "i-VI-III-VII"
    else:
        chords = [
            {"root": key, "quality": "major", "durationBars": 2, "romanNumeral": "I"},
            {"root": "G", "quality": "major", "durationBars": 2, "romanNumeral": "V"},
            {"root": "A", "quality": "minor", "durationBars": 2, "romanNumeral": "vi"},
            {"root": "F", "quality": "major", "durationBars": 2, "romanNumeral": "IV"},
        ]
        template = "I-V-vi-IV"

    half_bars = max(1, total_bars // 2)
    return {
        "title": title,
        "key": key,
        "mode": mode,
        "tempo": tempo,
        "timeSignature": {"numerator": 4, "denominator": 4},
        "sections": [
            {"name": "Part 1", "type": "intro", "startBar": 1, "endBar": half_bars},
            {"name": "Part 2", "type": "verse", "startBar": half_bars + 1, "endBar": total_bars},
        ],
        "progression": {
            "template": template,
            "chords": chords,
        },
        "tracks": [
            {
                "name": "AI Chords",
                "role": "chords",
                "generator": "chord",
                "instrument": "Piano",
                "octaveOffset": -1,
            },
            {
                "name": "AI Melody",
                "role": "melody",
                "generator": "melody",
                "instrument": "Synth",
                "octaveOffset": 0,
                "noteDensity": "medium",
            },
            {
                "name": "AI Arpeggio",
                "role": "arpeggio",
                "generator": "arpeggio",
                "instrument": "Guitar",
                "octaveOffset": 0,
                "pattern": "Up",
            },
        ],
        "generation": {
            "melodyDensity": "medium",
            "register": {"min": 48, "max": 84},
            "seed": seed,
        },
    }

async def generate_ai_composition(request: AICompositionRequest) -> AICompositionResponseSchema:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    if not api_key:
        # Fallback to internal generator when no live key is supplied
        mock_data = generate_mock_composition_spec(request)
        return AICompositionResponseSchema(**mock_data)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    
    prompt_text = f"User Request: '{request.prompt}'.\nAdditional Constraints:\n"
    if request.key:
        prompt_text += f"- Key: {request.key}\n"
    if request.scale:
        prompt_text += f"- Mode/Scale: {request.scale}\n"
    if request.tempo:
        prompt_text += f"- Tempo: {request.tempo} BPM\n"
    if request.bars:
        prompt_text += f"- Total Bars: {request.bars}\n"
    if request.style:
        prompt_text += f"- Style: {request.style}\n"
    if request.mood:
        prompt_text += f"- Mood: {request.mood}\n"
    if request.seed:
        prompt_text += f"- Seed: {request.seed}\n"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": SYSTEM_PROMPT},
                    {"text": prompt_text}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.95,
            "responseMimeType": "application/json"
        }
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_content = data["candidates"][0]["content"]["parts"][0]["text"]
                cleaned = clean_json_response(raw_content)
                parsed_json = json.loads(cleaned)
                return AICompositionResponseSchema(**parsed_json)
            else:
                # Log error and fallback
                mock_data = generate_mock_composition_spec(request)
                return AICompositionResponseSchema(**mock_data)
    except Exception:
        # Graceful fallback on network/parsing issues
        mock_data = generate_mock_composition_spec(request)
        return AICompositionResponseSchema(**mock_data)
