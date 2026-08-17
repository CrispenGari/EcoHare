import re

MYSQL_OPTIONS = {
    "mysql_engine": "InnoDB",
    "mysql_charset": "utf8mb4",
    "mysql_collate": "utf8mb4_unicode_ci",
}

UFH_EMAIL_PATTERN = re.compile(
    r"[A-Za-z0-9._%+-]+@ufh\.ac\.za",
    re.IGNORECASE,
)
PASSWORD_PATTERN = re.compile(
    r"(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
)
JWT_TOKEN_SECRETE = '06297b9faa5793ec73a1129152c214208432c07c905758d6d501d23a9e59cece71f11a0b444c1f7bf5ee3e35fd5c242a5602'