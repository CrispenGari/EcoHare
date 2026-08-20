from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from constants import MYSQL_OPTIONS
from enums import *
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    ForeignKey,
    Index,
    String,
    Text,
)
from sqlalchemy.dialects.mysql import CHAR, DATETIME, DECIMAL
from sqlalchemy.orm import Mapped, mapped_column
from utils import *

from db import Base


class StaffUser(Base):
    __tablename__ = "staff_users"
    __table_args__ = MYSQL_OPTIONS
    id: Mapped[str] = mapped_column(
        CHAR(36),
        primary_key=True,
        default=generate_uuid,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[StaffRole] = mapped_column(
        enum_column(StaffRole, "staff_role"),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DATETIME(fsp=6),
        default=utc_now,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DATETIME(fsp=6),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )


class Report(Base):
    __tablename__ = "reports"

    __table_args__ = (
        CheckConstraint(
            "latitude BETWEEN -90 AND 90",
            name="ck_reports_latitude",
        ),
        CheckConstraint(
            "longitude BETWEEN -180 AND 180",
            name="ck_reports_longitude",
        ),
        Index(
            "ix_reports_active_map",
            "verification_status",
            "status",
            "category",
        ),
        Index(
            "ix_reports_location",
            "latitude",
            "longitude",
        ),
        MYSQL_OPTIONS,
    )

    id: Mapped[str] = mapped_column(
        CHAR(36),
        primary_key=True,
        default=generate_uuid,
    )

    public_reference: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        nullable=False,
    )
    tracking_token_hash: Mapped[str] = mapped_column(
        CHAR(64),
        unique=True,
        nullable=False,
    )

    category: Mapped[IssueType] = mapped_column(
        enum_column(IssueType, "issue_type"),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    imageURL: Mapped[str | None] = mapped_column(
        Text,
        nullable=False,
    )

    latitude: Mapped[Decimal] = mapped_column(
        DECIMAL(10, 7),
        nullable=False,
    )

    longitude: Mapped[Decimal] = mapped_column(
        DECIMAL(10, 7),
        nullable=False,
    )

    location_label: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    status: Mapped[ReportStatus] = mapped_column(
        enum_column(ReportStatus, "report_status"),
        default=ReportStatus.SUBMITTED,
        nullable=False,
    )

    verification_status: Mapped[VerificationStatus] = mapped_column(
        enum_column(VerificationStatus, "verification_status"),
        default=VerificationStatus.PENDING,
        nullable=False,
    )

    # Used when two students report the same problem.
    duplicate_of_id: Mapped[str | None] = mapped_column(
        CHAR(36),
        ForeignKey("reports.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DATETIME(fsp=6),
        default=utc_now,
        nullable=False,
        index=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DATETIME(fsp=6),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DATETIME(fsp=6),
        nullable=True,
    )
