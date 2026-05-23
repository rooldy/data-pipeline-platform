"""
In-memory user store (remplacé par PostgreSQL en Phase 9 complète)
"""
import os
from app.auth.security import hash_password, verify_password

# Utilisateurs par défaut — override via variables d'environnement
_USERS = {
    "admin": {
        "username":      "admin",
        "hashed_password": hash_password(os.getenv("ADMIN_PASSWORD", "admin123")),
        "role":          "admin",
        "full_name":     "Administrateur",
        "email":         "admin@pipeline.local",
        "is_active":     True,
    },
    "analyst": {
        "username":      "analyst",
        "hashed_password": hash_password(os.getenv("ANALYST_PASSWORD", "analyst123")),
        "role":          "viewer",
        "full_name":     "Data Analyst",
        "email":         "analyst@pipeline.local",
        "is_active":     True,
    },
}


def get_user(username: str) -> dict | None:
    return _USERS.get(username)


def authenticate_user(username: str, password: str) -> dict | None:
    user = get_user(username)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    if not user["is_active"]:
        return None
    return user


def list_users() -> list[dict]:
    return [
        {k: v for k, v in u.items() if k != "hashed_password"}
        for u in _USERS.values()
    ]