from jose import JWTError, jwt

from app.config import get_settings

settings = get_settings()
ALGORITHM = "HS256"


def decode_access_token(token: str) -> dict[str, str]:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        if not user_id or not role:
            raise JWTError("Invalid token payload")
        return {"user_id": str(user_id), "role": str(role)}
    except JWTError as exc:
        raise ValueError("Invalid token") from exc
