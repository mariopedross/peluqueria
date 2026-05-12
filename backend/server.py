from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, logging, uuid, jwt, bcrypt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta, date, time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'esther-salon-secret-key-change-2026')
JWT_ALG = "HS256"
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'esther@salon.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Esther2026!')

app = FastAPI(title="Esther Pedrós Salón API")
api = APIRouter(prefix="/api")

# ---------- Models ----------
class AppointmentCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    service_id: str
    service_name: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    notes: Optional[str] = ""

class Appointment(AppointmentCreate):
    id: str
    status: str = "pending"  # pending | confirmed | cancelled | completed
    created_at: str

class StatusUpdate(BaseModel):
    status: str

class LoginInput(BaseModel):
    email: str
    password: str

# ---------- Helpers ----------
def make_token(email: str) -> str:
    payload = {"sub": email, "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Sin autorización")
    token = authorization.split(" ", 1)[1]
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        if data.get("sub") != ADMIN_EMAIL:
            raise HTTPException(401, "No autorizado")
    except jwt.PyJWTError:
        raise HTTPException(401, "Token inválido")
    return True

# ---------- Services (seeded) ----------
SERVICES = [
    {"id": "corte-mujer", "name": "Corte Mujer", "category": "Cortes", "duration": 45, "price": 22,
     "description": "Corte personalizado a tu estilo y forma de rostro. Incluye lavado y peinado final con producto profesional.",
     "image": "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80"},
    {"id": "corte-hombre", "name": "Corte Caballero", "category": "Cortes", "duration": 30, "price": 14,
     "description": "Corte clásico o moderno con acabado a tijera o máquina. Incluye perfilado de patillas y nuca.",
     "image": "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80"},
    {"id": "color-completo", "name": "Color Completo", "category": "Color", "duration": 120, "price": 55,
     "description": "Coloración integral del cabello con tintes profesionales sin amoniaco. Resultado uniforme y duradero.",
     "image": "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=800&q=80"},
    {"id": "mechas-balayage", "name": "Mechas Balayage", "category": "Color", "duration": 180, "price": 85,
     "description": "Técnica francesa de iluminación natural a mano alzada. Acabado degradado y luminoso muy favorecedor.",
     "image": "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80"},
    {"id": "mechas-babylights", "name": "Babylights", "category": "Color", "duration": 200, "price": 95,
     "description": "Mechas ultra finas que aportan luz como si fueras una niña al sol. Efecto sutil y muy natural.",
     "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"},
    {"id": "alisado-keratina", "name": "Alisado de Keratina", "category": "Tratamientos", "duration": 150, "price": 95,
     "description": "Tratamiento de keratina pura que alisa, repara e hidrata. Resultado liso y brillante hasta 4 meses.",
     "image": "https://images.unsplash.com/photo-1522337094846-8a818192de1f?auto=format&fit=crop&w=800&q=80"},
    {"id": "tratamiento-hidratacion", "name": "Hidratación Profunda", "category": "Tratamientos", "duration": 45, "price": 28,
     "description": "Mascarilla intensiva con aceites naturales para devolver brillo, suavidad y vida al cabello.",
     "image": "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=800&q=80"},
    {"id": "peinado-evento", "name": "Peinado de Evento", "category": "Eventos", "duration": 60, "price": 35,
     "description": "Recogido o semirecogido elegante para bodas, comuniones y eventos. Diseño exclusivo para ti.",
     "image": "https://images.unsplash.com/photo-1595877244574-e90ce41ce089?auto=format&fit=crop&w=800&q=80"},
    {"id": "novia-completo", "name": "Pack Novia", "category": "Eventos", "duration": 120, "price": 110,
     "description": "Prueba previa + peinado el día de tu boda. Diseño personalizado con accesorios incluidos.",
     "image": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"},
    {"id": "manicura", "name": "Manicura Esmaltado", "category": "Uñas", "duration": 45, "price": 18,
     "description": "Limado, cutículas y esmaltado de calidad. Larga duración y acabado impecable.",
     "image": "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80"},
    {"id": "manicura-semi", "name": "Manicura Semipermanente", "category": "Uñas", "duration": 60, "price": 25,
     "description": "Esmaltado semipermanente que dura hasta 3 semanas sin desconcharse. Más de 80 colores disponibles.",
     "image": "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=800&q=80"},
    {"id": "depilacion-cejas", "name": "Diseño de Cejas", "category": "Estética", "duration": 30, "price": 12,
     "description": "Diseño y depilación con cera para enmarcar tu mirada según la simetría de tu rostro.",
     "image": "https://images.unsplash.com/photo-1594125311687-3b1b3eafa9f4?auto=format&fit=crop&w=800&q=80"},
]

# Available time slots
SLOTS_WEEKDAY = ["09:30","10:30","11:30","12:30","13:30","16:30","17:30","18:30","19:30"]
SLOTS_SATURDAY = ["09:30","10:30","11:30","12:30","13:30"]

# ---------- Routes ----------
@api.get("/")
async def root():
    return {"app": "Esther Pedrós Salón", "status": "ok"}

@api.get("/services")
async def get_services():
    return SERVICES

@api.get("/availability")
async def availability(date_str: str):
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(400, "Fecha inválida")
    weekday = d.weekday()  # 0=Mon
    if weekday == 6:
        return {"date": date_str, "slots": [], "closed": True}
    base = SLOTS_SATURDAY if weekday == 5 else SLOTS_WEEKDAY
    taken_docs = await db.appointments.find(
        {"date": date_str, "status": {"$in": ["pending", "confirmed"]}},
        {"_id": 0, "time": 1}
    ).to_list(500)
    taken = {t["time"] for t in taken_docs}
    free = [s for s in base if s not in taken]
    return {"date": date_str, "slots": free, "closed": False}

@api.post("/appointments")
async def create_appointment(body: AppointmentCreate):
    if not any(s["id"] == body.service_id for s in SERVICES):
        raise HTTPException(400, "Servicio inválido")
    # check slot
    existing = await db.appointments.find_one(
        {"date": body.date, "time": body.time, "status": {"$in": ["pending", "confirmed"]}},
        {"_id": 0}
    )
    if existing:
        raise HTTPException(409, "Ese horario ya está reservado")
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "pending"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.appointments.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.get("/appointments/by-phone/{phone}")
async def my_appointments(phone: str):
    docs = await db.appointments.find({"phone": phone}, {"_id": 0}).sort("date", -1).to_list(100)
    return docs

@api.delete("/appointments/{appt_id}")
async def cancel_appointment(appt_id: str, phone: str):
    appt = await db.appointments.find_one({"id": appt_id, "phone": phone}, {"_id": 0})
    if not appt:
        raise HTTPException(404, "Cita no encontrada")
    await db.appointments.update_one({"id": appt_id}, {"$set": {"status": "cancelled"}})
    return {"ok": True}

# ----- Admin -----
@api.post("/admin/login")
async def admin_login(data: LoginInput):
    if data.email.strip().lower() != ADMIN_EMAIL.lower() or data.password != ADMIN_PASSWORD:
        raise HTTPException(401, "Credenciales incorrectas")
    return {"token": make_token(ADMIN_EMAIL), "email": ADMIN_EMAIL}

@api.get("/admin/appointments")
async def admin_list(_: bool = Depends(require_admin), status: Optional[str] = None):
    q = {}
    if status:
        q["status"] = status
    docs = await db.appointments.find(q, {"_id": 0}).sort("date", 1).to_list(1000)
    return docs

@api.patch("/admin/appointments/{appt_id}")
async def admin_update(appt_id: str, body: StatusUpdate, _: bool = Depends(require_admin)):
    if body.status not in ["pending", "confirmed", "cancelled", "completed"]:
        raise HTTPException(400, "Estado inválido")
    res = await db.appointments.update_one({"id": appt_id}, {"$set": {"status": body.status}})
    if res.matched_count == 0:
        raise HTTPException(404, "Cita no encontrada")
    return {"ok": True}

@api.get("/admin/stats")
async def admin_stats(_: bool = Depends(require_admin)):
    total = await db.appointments.count_documents({})
    pending = await db.appointments.count_documents({"status": "pending"})
    confirmed = await db.appointments.count_documents({"status": "confirmed"})
    today = datetime.now().strftime("%Y-%m-%d")
    today_count = await db.appointments.count_documents({"date": today, "status": {"$in": ["pending", "confirmed"]}})
    return {"total": total, "pending": pending, "confirmed": confirmed, "today": today_count}

app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
