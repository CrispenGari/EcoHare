import enum


class StaffRole(str, enum.Enum):
    WASTE_STAFF = "waste_staff"
    MAINTENANCE_STAFF = "maintenance_staff"
    FACILITIES_ADMIN = "facilities_admin"

class IssueType(str, enum.Enum):
    DUMPED_WASTE = "dumped_waste"
    VISIBLE_WATER_LEAK = "visible_water_leak"

class ReportStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    ACKNOWLEDGED = "acknowledged"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    DUPLICATE = "duplicate"
    CANCELLED = "cancelled"

class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    NEEDS_REVIEW = "needs_review"
    REJECTED = "rejected"

class ImagePurpose(str, enum.Enum):
    EVIDENCE = "evidence"
    RESOLUTION = "resolution"

class AIOutcome(str, enum.Enum):
    CONFIRMED = "confirmed"
    DIFFERENT_ISSUE = "different_issue"
    UNCERTAIN = "uncertain"
    NO_CLEAR_EVIDENCE = "no_clear_evidence"

class HumanReviewDecision(str, enum.Enum):
    APPROVED = "approved"
    REJECTED = "rejected"
    RECLASSIFIED = "reclassified"
    
class Language(str, enum.Enum):
    ENGLISH = "en"
    ISIXHOSA = "xh"
