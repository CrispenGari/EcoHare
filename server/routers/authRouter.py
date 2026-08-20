import secrets
from typing import Annotated

import jwt
from argon2 import PasswordHasher
from cache import redisClient
from constants import JWT_TOKEN_SECRETE, CachePrefixes, Constants
from db import get_db
from db.models import StaffUser
from enums import StaffRole
from fastapi import APIRouter, Body, Depends, Header
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.orm import Session
from utils import is_valid_password, is_valid_ufh_email

hasher = PasswordHasher(salt_len=12)
DbSession = Annotated[Session, Depends(get_db)]
authRouter = APIRouter(prefix="/api/v1/auth")

roles = ["waste_staff", "maintenance_staff", "facilities_admin"]


@authRouter.post("/register")
def register(
    email: Annotated[str, Body()],
    password: Annotated[str, Body()],
    fullName: Annotated[str, Body()],
    role: Annotated[str, Body()],
    db: DbSession,
):
    try:
        if not is_valid_ufh_email(email=email.strip().lower()):
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "The email address provided is invalid. Emails must be within the 'ufh' domain.",
                },
                status_code=200,
            )

        existing_staff = db.scalar(
            select(StaffUser).where(StaffUser.email == email.strip().lower())
        )
        if existing_staff:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "A staff account with this email already exists.",
                },
                status_code=200,
            )

        if not is_valid_password(password=password.strip()):
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "The password must contain at least 8 characters, with at least 1 digit, 1 special character and 1 capital character.",
                },
                status_code=200,
            )

        if len(fullName.strip().split(" ")) < 2:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "The full name must have a First Name and Last Name.",
                },
                status_code=200,
            )
        password_hash = hasher.hash(password=password.strip())
        if role not in roles:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "Invalid staff role.",
                },
                status_code=200,
            )

        selected_role = StaffRole.MAINTENANCE_STAFF
        if role == "waste_staff":
            selected_role = StaffRole.WASTE_STAFF
        elif role == "facilities_admin":
            selected_role = StaffRole.FACILITIES_ADMIN
        else:
            selected_role = StaffRole.MAINTENANCE_STAFF
        staff = StaffUser(
            email=email.strip().lower(),
            full_name=fullName.strip(),
            password_hash=password_hash,
            role=selected_role,
        )
        db.add(staff)
        db.commit()
        db.refresh(staff)
        token = jwt.encode({"id": staff.id}, JWT_TOKEN_SECRETE, algorithm="HS256")
        return JSONResponse(
            {"ok": True, "status": "success", "jwt": token},
            status_code=200,
        )
    except Exception:
        return JSONResponse(
            {
                "ok": False,
                "status": "error",
                "message": "Internal Server Error.",
            },
            status_code=500,
        )


@authRouter.post("/login")
def login(
    email: Annotated[str, Body()],
    password: Annotated[str, Body()],
    db: DbSession,
):
    try:
        staff = db.scalar(
            select(StaffUser).where(StaffUser.email == email.strip().lower())
        )
        if not staff:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "The staff with the email address provided was not found.",
                },
                status_code=200,
            )
        try:
            hasher.verify(staff.password_hash, password=password.strip())
            staff.is_active = True
            db.add(staff)
            db.commit()
            db.refresh(staff)
            token = jwt.encode({"id": staff.id}, JWT_TOKEN_SECRETE, algorithm="HS256")
            return JSONResponse(
                {"ok": True, "status": "success", "jwt": token},
                status_code=200,
            )
        except Exception:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "Invalid account password.",
                },
                status_code=200,
            )
    except Exception:
        return JSONResponse(
            {
                "ok": False,
                "status": "error",
                "message": "Internal Server Error.",
            },
            status_code=500,
        )


@authRouter.post("/logout")
def logout(
    db: DbSession,
    authorization: Annotated[str | None, Header()] = None,
):
    try:
        if authorization is None or len(authorization.split(" ")) != 2:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "You are not authenticated.",
                },
                status_code=401,
            )
        try:
            _, token = authorization.split(" ")
            payload = jwt.decode(token, JWT_TOKEN_SECRETE, algorithms=["HS256"])
        except Exception:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "You are not authenticated.",
                },
                status_code=401,
            )

        staff = db.scalar(select(StaffUser).where(StaffUser.id == payload.get("id")))
        if not staff:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "You are not authenticated.",
                },
                status_code=401,
            )
        staff.is_active = False
        db.add(staff)
        db.commit()
        db.refresh(staff)
        return JSONResponse(
            {"ok": True, "status": "success", "jwt": None},
            status_code=200,
        )
    except Exception:
        return JSONResponse(
            {
                "ok": False,
                "status": "error",
                "message": "Internal Server Error.",
            },
            status_code=500,
        )


@authRouter.get("/me")
def me(
    db: DbSession,
    authorization: Annotated[str | None, Header()] = None,
):
    try:
        if authorization is None or len(authorization.split(" ")) != 2:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "You are not authenticated.",
                },
                status_code=401,
            )
        try:
            _, token = authorization.split(" ")
            payload = jwt.decode(token, JWT_TOKEN_SECRETE, algorithms=["HS256"])
        except Exception:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "You are not authenticated.",
                },
                status_code=401,
            )

        staff = db.scalar(select(StaffUser).where(StaffUser.id == payload.get("id")))
        if not staff:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "You are not authenticated.",
                },
                status_code=401,
            )
        return JSONResponse(
            {
                "ok": True,
                "status": "success",
                "me": {
                    "id": staff.id,
                    "email": staff.email,
                    "full_name": staff.full_name,
                    "role": staff.role,
                    "is_active": staff.is_active,
                    "created_at": str(staff.created_at),
                    "updated_at": str(staff.updated_at),
                },
            },
            status_code=200,
        )
    except Exception as e:
        print(e)

        return JSONResponse(
            {
                "ok": False,
                "status": "error",
                "message": "Internal Server Error.",
            },
            status_code=500,
        )


@authRouter.post("/forgot-password")
def forgot_pwd(email: Annotated[str, Body(embed=True)], db: DbSession):
    try:
        staff = db.scalar(
            select(StaffUser).where(StaffUser.email == email.strip().lower())
        )
        if not staff:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "The staff with the email address provided was not found.",
                },
                status_code=200,
            )

        otp = secrets.randbelow(900000) + 100000
        email_msg = f"""
        Hi, we have received a request that you want to reset your EcoHare Password linked to the account:

        email: <{staff.email}>

        Your OTP code is: {otp}

        Please if you did not intend to so this action, you can ignore this email. Note that the OTP code expires in {Constants.OTP_EXPIRES_IN / 60} minutes.
        """

        success = redisClient.setex(
            f"{CachePrefixes.OTP}{staff.id}", Constants.OTP_EXPIRES_IN, otp
        )
        if success:
            print(email_msg)  # send the email here

        return JSONResponse(
            {
                "ok": True,
                "status": "success" if success else "fail",
            },
            status_code=200,
        )
    except Exception:
        return JSONResponse(
            {
                "ok": False,
                "status": "error",
                "message": "Internal Server Error.",
            },
            status_code=500,
        )


@authRouter.post("/reset-password")
def reset_pwd(
    email: Annotated[str, Body()],
    otp: Annotated[str, Body()],
    password: Annotated[str, Body()],
    db: DbSession,
):
    try:
        staff = db.scalar(
            select(StaffUser).where(StaffUser.email == email.strip().lower())
        )
        if not staff:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "The staff with the email address provided was not found.",
                },
                status_code=200,
            )
        storedOTP = redisClient.get(f"{CachePrefixes.OTP}{staff.id}")
        if storedOTP is None:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "Failed to reset the password, the OTP has expired.",
                },
                status_code=200,
            )
    
        if storedOTP.decode() != otp:
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "Failed to reset password, invalid OTP.",
                },
                status_code=200,
            )
        if not is_valid_password(password=password.strip()):
            return JSONResponse(
                {
                    "ok": False,
                    "status": "error",
                    "message": "The password must contain at least 8 characters, with at least 1 digit, 1 special character and 1 capital character.",
                },
                status_code=200,
            )
        password_hash = hasher.hash(password=password.strip())
        staff.password_hash = password_hash
        db.add(staff)
        db.commit()
        db.refresh(staff)
        redisClient.delete(f"{CachePrefixes.OTP}{staff.id}")
        return JSONResponse(
            {"ok": True, "status": "success"},
            status_code=200,
        )
    except Exception:
        return JSONResponse(
            {
                "ok": False,
                "status": "error",
                "message": "Internal Server Error.",
            },
            status_code=500,
        )



