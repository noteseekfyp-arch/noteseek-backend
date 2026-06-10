import os

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Note: no asyncpg vector codec registration here — pgvector.sqlalchemy.Vector
# handles serialization itself (text in/out). Registering the codec as well
# breaks inserts because values are double-encoded.
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_async_session():
    async with AsyncSessionLocal() as session:
        yield session