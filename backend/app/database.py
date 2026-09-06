from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
#use sqllite for testing前期测试后期更换PostgreSQL
DATABASE_URL = "sqlite:///./bc_housing.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()