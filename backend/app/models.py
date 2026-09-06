# For Python - Database
from sqlalchemy import Column, Integer, Float, String

from .database import Base


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True)

    address = Column(String, index=True)
    city = Column(String, index=True)
    postal_code = Column(String, nullable=True)

    property_type = Column(String, nullable=True)

    price = Column(Integer)

    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Float, nullable=True)

    floor_area = Column(Float, nullable=True)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    listing_url = Column(String, nullable=True)