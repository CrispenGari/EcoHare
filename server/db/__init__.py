
from collections.abc import Generator

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DATABASE_URL = "mysql+pymysql://root:root@localhost:3306/ecohare?charset=utf8mb4"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(
    bind=engine,
    class_=Session,
    autoflush=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass

def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session


def create_tables() -> None:
    tables = list(Base.metadata.tables.keys())

    print("Registered tables:", tables)

    if not tables:
        raise RuntimeError(
            "No SQLAlchemy tables are registered with Base.metadata."
        )

    Base.metadata.create_all(bind=engine)

    print(
        "Created MySQL tables:",
        inspect(engine).get_table_names(),
    )