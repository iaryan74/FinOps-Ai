"""
Authentication — JWT-based login/signup for Cloud FinOps AI Optimizer.
"""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext

from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from database import get_db
from models.schemas import UserSignup, UserLogin, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)


def _hash_password(password: str) -> str:
    return pwd_context.hash(password)


def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _create_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """Dependency: extract and validate JWT token."""
    if not credentials:
        return None

    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            return None
        return email
    except JWTError:
        return None


@router.post("/signup", response_model=TokenResponse)
def signup(data: UserSignup):
    """Register a new user account."""
    with get_db() as conn:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?", (data.email,)
        ).fetchone()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        hashed = _hash_password(data.password)
        conn.execute(
            "INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)",
            (data.email, hashed, data.full_name or ""),
        )

    token = _create_token(data.email)
    return TokenResponse(access_token=token, user_email=data.email)


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin):
    """Authenticate and receive JWT token."""
    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE email = ?", (data.email,)
        ).fetchone()

    if not user or not _verify_password(data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = _create_token(data.email)
    return TokenResponse(access_token=token, user_email=data.email)


@router.get("/me")
def get_me(current_user: str = Depends(get_current_user)):
    """Get current authenticated user info."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    with get_db() as conn:
        user = conn.execute(
            "SELECT id, email, full_name FROM users WHERE email = ?",
            (current_user,),
        ).fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"id": user["id"], "email": user["email"], "full_name": user["full_name"]}
