from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
import os

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy():
    # Default: 7 days. Override with ACCESS_TOKEN_LIFETIME_SECONDS in .env.
    lifetime = int(os.getenv("ACCESS_TOKEN_LIFETIME_SECONDS", "604800"))
    return JWTStrategy(
        secret=os.getenv("SECRET_KEY"),
        lifetime_seconds=lifetime,
    )

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)