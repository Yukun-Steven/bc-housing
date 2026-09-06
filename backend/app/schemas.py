#schemas for HTTp JSON -python
from pydantic import BaseModel, ConfigDict


class PropertyCreate(BaseModel):
    address: str
    city: str
    postal_code: str | None = None

    property_type: str | None = None

    price: float

    bedrooms: int | None = None
    bathrooms: float | None = None

    floor_area: float | None = None

    latitude: float | None = None
    longitude: float | None = None

    listing_url: str | None = None


class PropertyResponse(PropertyCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)