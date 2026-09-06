from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/properties",
    tags=["properties"],
)


@router.get("/", response_model=list[schemas.PropertyResponse])
def get_properties(
    city: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Property)

    if city:
        query = query.filter(
            models.Property.city.ilike(f"%{city}%")#ilike 不在乎大小写 字符
        )

    return query.all()


@router.post("/", response_model=schemas.PropertyResponse)
def create_property(
    property: schemas.PropertyCreate,
    db: Session = Depends(get_db),
):
    db_property = models.Property(**property.model_dump())

    db.add(db_property)
    db.commit()
    db.refresh(db_property)

    return db_property