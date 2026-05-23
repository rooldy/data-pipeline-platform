"""
Router FastAPI — Authentification
POST /api/v1/auth/login  → JWT token
GET  /api/v1/auth/me     → utilisateur courant
GET  /api/v1/auth/users  → liste utilisateurs (admin)
"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from app.auth.jwt import create_access_token, get_current_user, require_admin
from app.auth.users import authenticate_user, list_users

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    username:     str
    role:         str
    full_name:    str


class UserInfo(BaseModel):
    username:  str
    role:      str
    full_name: str
    email:     str


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authentification → JWT token"""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        logger.warning(f"Tentative de connexion échouée : {form_data.username}")
        raise HTTPException(
            status_code=401,
            detail="Identifiants incorrects",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user["username"], "role": user["role"]})
    logger.info(f"Connexion réussie : {user['username']} ({user['role']})")
    return TokenResponse(
        access_token=token,
        username=user["username"],
        role=user["role"],
        full_name=user["full_name"],
    )


@router.get("/me", response_model=UserInfo)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Retourne l'utilisateur connecté"""
    from app.auth.users import get_user
    user = get_user(current_user["username"])
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return UserInfo(
        username=user["username"],
        role=user["role"],
        full_name=user["full_name"],
        email=user["email"],
    )


@router.get("/users")
async def get_users(_: dict = Depends(require_admin)):
    """Liste des utilisateurs — admin seulement"""
    return list_users()


@router.post("/logout")
async def logout(_: dict = Depends(get_current_user)):
    """Logout — côté client on supprime le token"""
    return {"message": "Déconnecté avec succès"}