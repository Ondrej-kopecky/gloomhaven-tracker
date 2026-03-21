from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import databases
import sqlalchemy
import os
import secrets
import smtplib
import random
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from collections import defaultdict
import time

# --- Config ---
SECRET_KEY = os.environ.get("SECRET_KEY", secrets.token_hex(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hodin

DATABASE_URL = "sqlite:///./data/app.db"

# SMTP config
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.seznam.cz")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USER)

# --- Database ---
database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

users = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("email", sqlalchemy.String, unique=True, index=True),
    sqlalchemy.Column("username", sqlalchemy.String, unique=True, index=True),
    sqlalchemy.Column("hashed_password", sqlalchemy.String),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, default=datetime.utcnow),
    sqlalchemy.Column("is_verified", sqlalchemy.Boolean, default=False),
    sqlalchemy.Column("verification_code", sqlalchemy.String, nullable=True),
    sqlalchemy.Column("verification_code_expires_at", sqlalchemy.DateTime, nullable=True),
    sqlalchemy.Column("resend_count", sqlalchemy.Integer, default=0),
    sqlalchemy.Column("resend_window_start", sqlalchemy.DateTime, nullable=True),
)

campaigns = sqlalchemy.Table(
    "campaigns",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("user_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id"), nullable=False),
    sqlalchemy.Column("name", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("created_at", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("last_played_at", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("data", sqlalchemy.Text, nullable=False),
    sqlalchemy.Column("updated_at", sqlalchemy.DateTime, default=datetime.utcnow),
)

# Create index for campaigns.user_id
sqlalchemy.Index("idx_campaigns_user", campaigns.c.user_id)

engine = sqlalchemy.create_engine(
    DATABASE_URL.replace("sqlite:///", "sqlite:///"),
    connect_args={"check_same_thread": False},
)
metadata.create_all(engine)


# --- Migration for existing DB ---
def migrate_db():
    """Add new columns to existing users table if they don't exist."""
    with engine.connect() as conn:
        # Check existing columns in users table
        result = conn.execute(sqlalchemy.text("PRAGMA table_info(users)"))
        existing_columns = {row[1] for row in result}

        migrations = {
            "is_verified": "ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0",
            "verification_code": "ALTER TABLE users ADD COLUMN verification_code TEXT",
            "verification_code_expires_at": "ALTER TABLE users ADD COLUMN verification_code_expires_at DATETIME",
            "resend_count": "ALTER TABLE users ADD COLUMN resend_count INTEGER DEFAULT 0",
            "resend_window_start": "ALTER TABLE users ADD COLUMN resend_window_start DATETIME",
        }

        for col, sql in migrations.items():
            if col not in existing_columns:
                conn.execute(sqlalchemy.text(sql))
                conn.commit()


migrate_db()

# --- Auth ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# --- Rate Limiter (in-memory) ---
class RateLimiter:
    def __init__(self):
        self._requests: dict[str, list[float]] = defaultdict(list)

    def _cleanup(self, key: str, window_seconds: float):
        now = time.time()
        self._requests[key] = [
            t for t in self._requests[key] if now - t < window_seconds
        ]

    def check(self, key: str, max_requests: int, window_seconds: float) -> bool:
        """Returns True if request is allowed, False if rate limited."""
        self._cleanup(key, window_seconds)
        if len(self._requests[key]) >= max_requests:
            return False
        self._requests[key].append(time.time())
        return True


rate_limiter = RateLimiter()


# --- Models ---
class UserCreate(BaseModel):
    email: str
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_verified: bool
    created_at: str


class Token(BaseModel):
    access_token: str
    token_type: str


class VerifyRequest(BaseModel):
    email: str
    code: str


class ResendCodeRequest(BaseModel):
    email: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str

class CampaignSummary(BaseModel):
    id: str
    name: str
    createdAt: str
    lastPlayedAt: str


class CampaignData(BaseModel):
    id: str
    name: str
    createdAt: str
    lastPlayedAt: str
    prosperityIndex: Optional[int] = 0
    globalAchievements: Optional[dict] = {}
    partyAchievements: Optional[dict] = {}
    party: Optional[dict] = {}
    characters: Optional[list] = []
    archivedCharacters: Optional[list] = []
    scenarios: Optional[dict] = {}
    notes: Optional[str] = ""
    personalQuests: Optional[dict] = {}
    hideSpoilers: Optional[bool] = False


# --- Helpers ---
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def generate_verification_code() -> str:
    return f"{random.randint(0, 999999):06d}"


def send_verification_email(to_email: str, code: str):
    """Send verification code via SMTP with dark fantasy HTML template."""
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"[SMTP] SMTP not configured. Verification code for {to_email}: {code}")
        return

    html = f"""<!DOCTYPE html>
<html lang="cs">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0813;font-family:Georgia,serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0813;padding:40px 0">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#12101d;border:1px solid rgba(196,163,90,0.15);border-radius:16px;overflow:hidden">

  <!-- Header -->
  <tr><td style="padding:32px 40px 20px;text-align:center;border-bottom:1px solid rgba(196,163,90,0.1)">
    <h1 style="margin:0;font-size:22px;font-weight:bold;color:#c4a35a;letter-spacing:3px;text-transform:uppercase;font-family:Georgia,serif">Gloomhaven</h1>
    <p style="margin:4px 0 0;font-size:11px;color:#6b7280;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif">Campaign Tracker</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:32px 40px">
    <p style="margin:0 0 8px;font-size:15px;color:#d1d5db;font-family:Arial,sans-serif">Ahoj,</p>
    <p style="margin:0 0 28px;font-size:15px;color:#9ca3af;line-height:1.6;font-family:Arial,sans-serif">pro ověření tvého účtu zadej tento kód:</p>

    <!-- Code block - one big copyable text -->
    <table cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding:0 0 8px">
          <div style="background:#1a1428;border:1px solid rgba(196,163,90,0.3);border-radius:12px;padding:20px 32px;display:inline-block">
            <p style="margin:0;font-size:40px;font-weight:bold;letter-spacing:10px;font-family:'Courier New',monospace;color:#c4a35a">{code}</p>
          </div>
        </td>
      </tr>
    </table>

    <p style="margin:16px 0 24px;font-size:12px;color:#6b7280;text-align:center;font-family:Arial,sans-serif">Kód platí 15 minut</p>

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px"><tr>
      <td style="height:1px;background:rgba(196,163,90,0.15)"></td>
    </tr></table>

    <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.5;text-align:center;font-family:Arial,sans-serif">
      Pokud jsi o registraci nežádal/a, tento email ignoruj.
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:16px 40px 24px;text-align:center;border-top:1px solid rgba(196,163,90,0.08)">
    <a href="https://gloomhaven.ongy.cz" style="font-size:11px;color:#c4a35a;text-decoration:none;letter-spacing:1px;font-family:Arial,sans-serif">gloomhaven.ongy.cz</a>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>"""

    plain = f"""Ahoj!

Tvůj ověřovací kód pro Gloomhaven Tracker je: {code}

Kód platí 15 minut.

Pokud jsi o registraci nežádal/a, tento email ignoruj.

— Gloomhaven Tracker (gloomhaven.ongy.cz)
"""

    msg = MIMEMultipart("alternative")
    msg["From"] = f"Gloomhaven Tracker <{SMTP_FROM}>"
    msg["To"] = to_email
    msg["Subject"] = "Ověření účtu – Gloomhaven Tracker"
    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_FROM, to_email, msg.as_string())


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    query = users.select().where(users.c.email == email)
    user = await database.fetch_one(query)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# --- App ---
app = FastAPI(title="Ongy.cz API", docs_url="/api/docs", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ongy.cz",
        "https://www.ongy.cz",
        "https://gloomhaven.ongy.cz",
        "http://localhost:5173",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.on_event("startup")
async def startup():
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


# --- Auth Routes ---
@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "ongy-api"}


@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate, request: Request):
    # Rate limit: 5 per hour per IP
    ip = get_client_ip(request)
    if not rate_limiter.check(f"register:{ip}", 5, 3600):
        raise HTTPException(status_code=429, detail="Příliš mnoho registrací. Zkus to za hodinu.")

    # Check if email exists
    existing_email = await database.fetch_one(
        users.select().where(users.c.email == user.email)
    )
    if existing_email:
        raise HTTPException(status_code=400, detail="Tento email je již registrovaný")

    # Check if username exists
    existing_username = await database.fetch_one(
        users.select().where(users.c.username == user.username)
    )
    if existing_username:
        raise HTTPException(status_code=400, detail="Toto uživatelské jméno je již zabrané")

    # Generate verification code
    code = generate_verification_code()
    code_expires = datetime.utcnow() + timedelta(minutes=15)

    # Create user (unverified)
    query = users.insert().values(
        email=user.email,
        username=user.username,
        hashed_password=hash_password(user.password),
        created_at=datetime.utcnow(),
        is_verified=False,
        verification_code=code,
        verification_code_expires_at=code_expires,
        resend_count=0,
        resend_window_start=datetime.utcnow(),
    )
    user_id = await database.execute(query)

    # Send verification email
    try:
        send_verification_email(user.email, code)
    except Exception as e:
        print(f"[SMTP] Failed to send email to {user.email}: {e}")

    return UserResponse(
        id=user_id,
        email=user.email,
        username=user.username,
        is_verified=False,
        created_at=datetime.utcnow().isoformat(),
    )


@app.post("/api/auth/verify")
async def verify_email(data: VerifyRequest):
    query = users.select().where(users.c.email == data.email)
    user = await database.fetch_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="Uživatel nenalezen")

    if user.is_verified:
        return {"message": "Účet je již ověřený"}

    if not user.verification_code or not user.verification_code_expires_at:
        raise HTTPException(status_code=400, detail="Žádný ověřovací kód. Použij resend-code.")

    if datetime.utcnow() > user.verification_code_expires_at:
        raise HTTPException(status_code=400, detail="Kód vypršel. Použij resend-code pro nový.")

    if user.verification_code != data.code:
        raise HTTPException(status_code=400, detail="Nesprávný kód")

    # Mark as verified
    await database.execute(
        users.update()
        .where(users.c.id == user.id)
        .values(
            is_verified=True,
            verification_code=None,
            verification_code_expires_at=None,
        )
    )
    return {"message": "Účet úspěšně ověřen"}


@app.post("/api/auth/resend-code")
async def resend_code(data: ResendCodeRequest):
    query = users.select().where(users.c.email == data.email)
    user = await database.fetch_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="Uživatel nenalezen")

    if user.is_verified:
        return {"message": "Účet je již ověřený"}

    # Anti-spam: max 3 resends per hour
    now = datetime.utcnow()
    resend_count = user.resend_count or 0
    resend_window = user.resend_window_start

    if resend_window and (now - resend_window) < timedelta(hours=1):
        if resend_count >= 3:
            raise HTTPException(
                status_code=429,
                detail="Maximálně 3 pokusy za hodinu. Zkus to později.",
            )
        new_count = resend_count + 1
        new_window = resend_window
    else:
        # Reset window
        new_count = 1
        new_window = now

    code = generate_verification_code()
    code_expires = now + timedelta(minutes=15)

    await database.execute(
        users.update()
        .where(users.c.id == user.id)
        .values(
            verification_code=code,
            verification_code_expires_at=code_expires,
            resend_count=new_count,
            resend_window_start=new_window,
        )
    )

    try:
        send_verification_email(data.email, code)
    except Exception as e:
        print(f"[SMTP] Failed to send email to {data.email}: {e}")
        raise HTTPException(status_code=500, detail="Nepodařilo se odeslat email")

    return {"message": "Nový kód odeslán na email"}



@app.post("/api/auth/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    if not rate_limiter.check(f"forgot:{client_ip}", 5, 3600):
        raise HTTPException(status_code=429, detail="Příliš mnoho pokusů. Zkus to za hodinu.")
    user = await database.fetch_one(users.select().where(users.c.email == req.email))
    if not user:
        return {"message": "Pokud ucet existuje, byl odeslan kod pro reset hesla"}
    code = generate_verification_code()
    expires = datetime.utcnow() + timedelta(minutes=15)
    await database.execute(users.update().where(users.c.id == user.id).values(
        verification_code=code, verification_code_expires_at=expires))
    send_verification_email(req.email, code)
    return {"message": "Pokud ucet existuje, byl odeslan kod pro reset hesla"}


@app.post("/api/auth/reset-password")
async def reset_password(req: ResetPasswordRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    if not rate_limiter.check(f"reset:{client_ip}", 10, 3600):
        raise HTTPException(status_code=429, detail="Příliš mnoho pokusů. Zkus to za hodinu.")
    user = await database.fetch_one(users.select().where(users.c.email == req.email))
    if not user:
        raise HTTPException(400, "Neplatny pozadavek")
    if not user.verification_code or user.verification_code != req.code:
        raise HTTPException(400, "Nespravny kod")
    if user.verification_code_expires_at and user.verification_code_expires_at < datetime.utcnow():
        raise HTTPException(400, "Kod vyprsel. Pozadejte o novy.")
    if len(req.new_password) < 6:
        raise HTTPException(400, "Heslo musi mit alespon 6 znaku")
    hashed = hash_password(req.new_password)
    await database.execute(users.update().where(users.c.id == user.id).values(
        hashed_password=hashed, verification_code=None, verification_code_expires_at=None))
    return {"message": "Heslo bylo zmeneno"}


@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), request: Request = None):
    # Rate limit: 10 per hour per IP
    if request:
        ip = get_client_ip(request)
        if not rate_limiter.check(f"login:{ip}", 10, 3600):
            raise HTTPException(status_code=429, detail="Příliš mnoho pokusů o přihlášení. Zkus to za hodinu.")

    query = users.select().where(users.c.email == form_data.username)
    user = await database.fetch_one(query)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Špatný email nebo heslo")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Účet není ověřený. Zkontroluj email.")

    token = create_access_token(data={"sub": user.email})
    return Token(access_token=token, token_type="bearer")


@app.get("/api/auth/me", response_model=UserResponse)
async def me(current_user=Depends(get_current_user)):
    created_at = current_user.created_at
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        is_verified=current_user.is_verified,
        created_at=created_at or "",
    )


# --- Campaign Routes ---
@app.get("/api/campaigns/", response_model=list[CampaignSummary])
async def list_campaigns(current_user=Depends(get_current_user)):
    query = (
        campaigns.select()
        .where(campaigns.c.user_id == current_user.id)
        .order_by(campaigns.c.last_played_at.desc())
    )
    rows = await database.fetch_all(query)
    return [
        CampaignSummary(
            id=row.id,
            name=row.name,
            createdAt=row.created_at,
            lastPlayedAt=row.last_played_at,
        )
        for row in rows
    ]


@app.get("/api/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str, current_user=Depends(get_current_user)):
    query = campaigns.select().where(
        (campaigns.c.id == campaign_id) & (campaigns.c.user_id == current_user.id)
    )
    row = await database.fetch_one(query)
    if not row:
        raise HTTPException(status_code=404, detail="Kampaň nenalezena")
    return json.loads(row.data)


@app.post("/api/campaigns/", response_model=CampaignSummary)
async def save_campaign(
    campaign: CampaignData,
    request: Request,
    current_user=Depends(get_current_user),
):
    # Rate limit: 60 per minute per user
    if not rate_limiter.check(f"campaign_save:{current_user.id}", 60, 60):
        raise HTTPException(status_code=429, detail="Příliš mnoho uložení. Zkus to za chvíli.")

    campaign_json = campaign.model_dump_json()

    # Check if campaign exists for this user
    query = campaigns.select().where(
        (campaigns.c.id == campaign.id) & (campaigns.c.user_id == current_user.id)
    )
    existing = await database.fetch_one(query)

    if existing:
        # Update (upsert)
        await database.execute(
            campaigns.update()
            .where(campaigns.c.id == campaign.id)
            .values(
                name=campaign.name,
                created_at=campaign.createdAt,
                last_played_at=campaign.lastPlayedAt,
                data=campaign_json,
                updated_at=datetime.utcnow(),
            )
        )
    else:
        # Insert
        await database.execute(
            campaigns.insert().values(
                id=campaign.id,
                user_id=current_user.id,
                name=campaign.name,
                created_at=campaign.createdAt,
                last_played_at=campaign.lastPlayedAt,
                data=campaign_json,
                updated_at=datetime.utcnow(),
            )
        )

    return CampaignSummary(
        id=campaign.id,
        name=campaign.name,
        createdAt=campaign.createdAt,
        lastPlayedAt=campaign.lastPlayedAt,
    )


@app.delete("/api/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str, current_user=Depends(get_current_user)):
    query = campaigns.select().where(
        (campaigns.c.id == campaign_id) & (campaigns.c.user_id == current_user.id)
    )
    existing = await database.fetch_one(query)
    if not existing:
        raise HTTPException(status_code=404, detail="Kampaň nenalezena")

    await database.execute(
        campaigns.delete().where(campaigns.c.id == campaign_id)
    )
    return {"message": "Kampaň smazána"}


# --- Feedback ---
class FeedbackData(BaseModel):
    type: str  # bug, suggestion, other
    message: str
    email: Optional[str] = None
    page: Optional[str] = None
    userAgent: Optional[str] = None

feedback_table = sqlalchemy.Table(
    "feedback",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("type", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("message", sqlalchemy.Text, nullable=False),
    sqlalchemy.Column("email", sqlalchemy.String, nullable=True),
    sqlalchemy.Column("page", sqlalchemy.String, nullable=True),
    sqlalchemy.Column("user_agent", sqlalchemy.String, nullable=True),
    sqlalchemy.Column("ip", sqlalchemy.String, nullable=True),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, default=datetime.utcnow),
)
feedback_table.create(engine, checkfirst=True)

@app.post("/api/feedback")
async def submit_feedback(data: FeedbackData, request: Request):
    ip = get_client_ip(request)
    if not rate_limiter.check(f"feedback:{ip}", 5, 3600):
        raise HTTPException(status_code=429, detail="Příliš mnoho zpráv. Zkus to za hodinu.")
    
    await database.execute(
        feedback_table.insert().values(
            type=data.type,
            message=data.message,
            email=data.email,
            page=data.page,
            user_agent=data.userAgent,
            ip=ip,
            created_at=datetime.utcnow(),
        )
    )
    
    # Optional: send email notification
    if SMTP_USER and SMTP_PASSWORD:
        try:
            msg = MIMEText(
                f"Typ: {data.type}\nStránka: {data.page}\nEmail: {data.email or neuvedeno}\nIP: {ip}\n\n{data.message}",
                "plain", "utf-8"
            )
            msg["From"] = f"GH Tracker <{SMTP_FROM}>"
            msg["To"] = SMTP_USER
            msg["Subject"] = f"[GH Feedback] {data.type}: {data.message[:50]}"
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_FROM, SMTP_USER, msg.as_string())
        except Exception as e:
            print(f"[SMTP] Failed to send feedback notification: {e}")
    
    return {"ok": True}
