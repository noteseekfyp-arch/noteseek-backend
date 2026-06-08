"""note generation fields

Revision ID: d4e5f6a7b8c9
Revises: a1b2c3d4e5f6
Create Date: 2026-05-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("notes", sa.Column("course_id", sa.UUID(), nullable=True))
    op.add_column("notes", sa.Column("kind", sa.String(length=32), nullable=True))
    op.add_column("notes", sa.Column("is_generated", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("notes", sa.Column("source_material_ids", sa.Text(), nullable=True))
    op.add_column("notes", sa.Column("metadata_json", sa.Text(), nullable=True))
    op.create_foreign_key("fk_notes_course_id", "notes", "courses", ["course_id"], ["id"])


def downgrade() -> None:
    op.drop_constraint("fk_notes_course_id", "notes", type_="foreignkey")
    op.drop_column("notes", "metadata_json")
    op.drop_column("notes", "source_material_ids")
    op.drop_column("notes", "is_generated")
    op.drop_column("notes", "kind")
    op.drop_column("notes", "course_id")
