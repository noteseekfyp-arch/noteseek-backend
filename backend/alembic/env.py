from logging.config import fileConfig
import os
import sys

from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool, create_engine

from alembic import context

load_dotenv()

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import Base
from app.models.user import User
from app.notes.models import Note
from app.courses.models import Course, CourseEnrollment
from app.materials.models import Material
from app.rag.models import DocumentChunk

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

def _migration_database_url() -> str:
    """Use DATABASE_URL from .env (same as the app); Alembic needs a sync driver."""
    url = os.getenv("DATABASE_URL") or config.get_main_option("sqlalchemy.url")
    if not url:
        raise RuntimeError("Set DATABASE_URL in backend/.env or sqlalchemy.url in alembic.ini")
    if url.startswith("postgresql://") and "+psycopg2" not in url and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    else:
        url = url.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
    # asyncpg uses ssl=require; psycopg2 expects sslmode=require
    return url.replace("ssl=require", "sslmode=require")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = _migration_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = create_engine(_migration_database_url(), poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
