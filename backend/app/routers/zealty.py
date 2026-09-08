from fastapi import APIRouter, HTTPException
from ..crawler.zealty import search_zealty

router = APIRouter(prefix="/zealty", tags=["zealty"])


@router.get("/search")
async def search_zealty_properties(city: str = "vancouver-city"):
    try:
        result = await search_zealty(city, limit=5)
        return result
    except Exception as error:
        print("Zealty error:", error)
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve listings from Zealty.",
        )