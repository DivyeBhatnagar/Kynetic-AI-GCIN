"""add_auth_and_api_keys

Revision ID: 4f8b91a2c3d5
Revises: 3d7450407dd4
Create Date: 2026-10-26 16:58:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4f8b91a2c3d5'
down_revision: Union[str, None] = '3d7450407dd4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add password_hash to users table
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('password_hash', sa.String(length=255), nullable=True))

    # 2. Create api_keys table
    op.create_table(
        'api_keys',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('organization_id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('prefix', sa.String(length=32), nullable=False),
        sa.Column('hashed_key', sa.String(length=128), nullable=False),
        sa.Column('scopes_json', sa.JSON(), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='ACTIVE'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_api_keys_org_id', 'api_keys', ['organization_id'], unique=False)
    op.create_index('ix_api_keys_user_id', 'api_keys', ['user_id'], unique=False)
    op.create_index('ix_api_keys_prefix', 'api_keys', ['prefix'], unique=False)
    op.create_index('ix_api_keys_hashed_key', 'api_keys', ['hashed_key'], unique=True)
    op.create_index('ix_api_keys_org_status', 'api_keys', ['organization_id', 'status'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_api_keys_org_status', table_name='api_keys')
    op.drop_index('ix_api_keys_hashed_key', table_name='api_keys')
    op.drop_index('ix_api_keys_prefix', table_name='api_keys')
    op.drop_index('ix_api_keys_user_id', table_name='api_keys')
    op.drop_index('ix_api_keys_org_id', table_name='api_keys')
    op.drop_table('api_keys')

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('password_hash')
