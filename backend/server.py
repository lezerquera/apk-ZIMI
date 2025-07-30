from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="ZIMI - Zerquera Integrative Medical Institute API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class AppointmentType(str, Enum):
    PRESENCIAL = "presencial"
    TELEMEDICINA = "telemedicina"

class AppointmentStatus(str, Enum):
    SOLICITADA = "solicitada"
    CONFIRMADA = "confirmada"
    COMPLETADA = "completada"
    CANCELADA = "cancelada"

class ServiceType(str, Enum):
    ACUPUNTURA = "acupuntura"
    MEDICINA_ORIENTAL = "medicina_oriental"
    MEDICINA_FUNCIONAL = "medicina_funcional"
    MEDICINA_ORTOMOLECULAR = "medicina_ortomolecular"
    HOMEOPATIA = "homeopatia"
    NUTRICION_TCM = "nutricion_tcm"
    FISIOTERAPIA = "fisioterapia"
    TERAPIA_OZONO = "terapia_ozono"
    TERAPIA_INYECCION = "terapia_inyeccion"
    HERBAL_TCM = "herbal_tcm"

# Models
class Patient(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    apellido: str
    email: str
    telefono: str
    fecha_nacimiento: Optional[str] = None
    direccion: Optional[str] = None
    numero_seguro: Optional[str] = None
    seguro: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PatientCreate(BaseModel):
    nombre: str
    apellido: str
    email: str
    telefono: str
    fecha_nacimiento: Optional[str] = None
    direccion: Optional[str] = None
    numero_seguro: Optional[str] = None
    seguro: Optional[str] = None

class Appointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    patient_name: str
    patient_email: str
    patient_phone: str
    service_type: ServiceType
    appointment_type: AppointmentType
    fecha_solicitada: str
    hora_solicitada: str
    mensaje: Optional[str] = None
    status: AppointmentStatus = AppointmentStatus.SOLICITADA
    created_at: datetime = Field(default_factory=datetime.utcnow)
    confirmed_at: Optional[datetime] = None
    telemedicine_link: Optional[str] = None

class AppointmentCreate(BaseModel):
    patient_name: str
    patient_email: str
    patient_phone: str
    service_type: ServiceType
    appointment_type: AppointmentType
    fecha_solicitada: str
    hora_solicitada: str
    mensaje: Optional[str] = None

class Contact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    email: str
    telefono: str
    asunto: str
    mensaje: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ContactCreate(BaseModel):
    nombre: str
    email: str
    telefono: str
    asunto: str
    mensaje: str

# Routes
# Auth routes
@api_router.post("/auth/register")
async def register_patient(patient_data: PatientCreate):
    # Check if patient already exists
    existing_patient = await db.patients.find_one({"email": patient_data.email})
    if existing_patient:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    
    # Create patient with authentication
    patient_dict = patient_data.dict()
    patient_obj = Patient(**patient_dict)
    
    # Save to database
    await db.patients.insert_one(patient_obj.dict())
    
    return {
        "message": "Paciente registrado exitosamente",
        "patient_id": patient_obj.id,
        "patient_name": patient_obj.nombre
    }

@api_router.post("/auth/login")
async def login_patient(email: str, phone: str):
    # Find patient by email and phone
    patient = await db.patients.find_one({
        "email": email,
        "telefono": phone
    })
    
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    return {
        "message": "Login exitoso",
        "patient_id": patient["id"],
        "patient_name": patient["nombre"],
        "patient_email": patient["email"]
    }

@api_router.post("/auth/admin/login")
async def admin_login(email: str, password: str):
    # Admin credentials - in production, use proper password hashing
    ADMIN_EMAIL = "admin@drzerquera.com"
    ADMIN_PASSWORD = "ZimiAdmin2025!"
    
    if email != ADMIN_EMAIL or password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Credenciales de administrador inválidas")
    
    return {
        "message": "Admin login exitoso",
        "role": "admin",
        "access_token": "admin_token_zimi_2025"
    }

# Protected routes for patients
@api_router.get("/patient/{patient_id}/appointments")
async def get_patient_appointments(patient_id: str):
    appointments = await db.appointments.find({"patient_id": patient_id}).sort("created_at", -1).to_list(100)
    return [Appointment(**appointment) for appointment in appointments]

@api_router.get("/patient/{patient_id}/profile")
async def get_patient_profile(patient_id: str):
    patient = await db.patients.find_one({"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    return Patient(**patient)

# Notification system for admin
@api_router.post("/admin/notifications/new-appointment")
async def notify_new_appointment(appointment_id: str):
    # This would trigger push notification to admin
    return {"message": "Notificación enviada al administrador"}

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "ZIMI API - Zerquera Integrative Medical Institute"}

@api_router.get("/services")
async def get_services():
    services = [
        {
            "id": "acupuntura",
            "nombre": "Acupuntura",
            "descripcion": "Técnica de curación milenaria que utiliza agujas finas para restaurar el equilibrio, aliviar el dolor y promover el bienestar general.",
            "duracion": "45-60 minutos",
            "precio_estimado": "Consultar",
            "disponible_telemedicina": False
        },
        {
            "id": "medicina_oriental",
            "nombre": "Medicina Oriental",
            "descripcion": "Enfoque integral que combina diagnóstico tradicional chino con técnicas modernas para tratar la causa raíz de las enfermedades.",
            "duracion": "60 minutos",
            "precio_estimado": "Consultar",
            "disponible_telemedicina": True
        },
        {
            "id": "medicina_funcional",
            "nombre": "Medicina Funcional",
            "descripcion": "Enfoque personalizado que identifica y trata las causas fundamentales de las enfermedades crónicas.",
            "duracion": "90 minutos",
            "precio_estimado": "Consultar",
            "disponible_telemedicina": True
        },
        {
            "id": "medicina_ortomolecular",
            "nombre": "Medicina Ortomolecular",
            "descripcion": "Tratamiento que utiliza nutrientes en dosis terapéuticas para restaurar el equilibrio bioquímico óptimo.",
            "duracion": "60 minutos",
            "precio_estimado": "Consultar",
            "disponible_telemedicina": True
        },
        {
            "id": "homeopatia",
            "nombre": "Medicina Homeopática",
            "descripcion": "Sistema de medicina natural que estimula la capacidad innata del cuerpo para curarse a sí mismo.",
            "duracion": "75 minutos",
            "precio_estimado": "Consultar",
            "disponible_telemedicina": True
        },
        {
            "id": "nutricion_tcm",
            "nombre": "Consulta de Nutrición TCM",
            "descripcion": "Orientación personalizada sobre el uso de principios de la Medicina Tradicional China para optimizar la salud a través de la nutrición adecuada.",
            "duracion": "45 minutos",
            "precio_estimado": "Consultar",
            "disponible_telemedicina": True
        },
        {
            "id": "fisioterapia",
            "nombre": "Fisioterapia",
            "descripcion": "Ejercicios personalizados y técnicas manuales para optimizar el movimiento, reducir el dolor y mejorar la función física.",
            "duracion": "45 minutos",
            "precio_estimado": "Consultar",
            "disponible_telemedicina": False
        },
        {
            "id": "terapia_ozono",
            "nombre": "Terapia de Ozono en Acupuntos",
            "descripcion": "Aplicación dirigida de ozono en puntos de acupuntura para mejorar la curación, apoyar el sistema inmunológico y aliviar el dolor.",
            "duracion": "30 minutos",
            "precio_estimado": "Consultar",
            "disponible_telemedicina": False
        },
        {
            "id": "terapia_inyeccion",
            "nombre": "Terapia de Inyección",
            "descripcion": "Utilización de inyecciones especializadas para administrar sustancias naturales para el alivio dirigido del dolor y la regeneración de tejidos.",
            "duracion": "30 minutos",
            "precio_estimado": "Consultar",
            "disponible_telemedicina": False
        },
        {
            "id": "herbal_tcm",
            "nombre": "Consulta Herbal TCM",
            "descripcion": "Asesoramiento experto sobre la incorporación de la Medicina Herbal China Tradicional para objetivos personalizados de salud y bienestar.",
            "duracion": "60 minutos",
            "precio_estimado": "Consultar",
            "disponible_telemedicina": True
        }
    ]
    return services

@api_router.get("/doctor-info")
async def get_doctor_info():
    return {
        "nombre": "Dr. Pablo Zerquera",
        "titulo": "OMD, AP, PhD",
        "especialidades": [
            "Medicina Oriental y Acupuntura",
            "Medicina Funcional",
            "Medicina Ortomolecular", 
            "Medicina Homeopática",
            "Manejo del Dolor"
        ],
        "educacion": [
            {
                "institucion": "Universidad de La Habana",
                "titulo": "Título Médico",
                "pais": "Cuba"
            },
            {
                "institucion": "AMC Miami",
                "titulo": "Grado en Medicina Oriental y Acupuntura",
                "pais": "Florida, USA"
            },
            {
                "institucion": "Cambridge International University",
                "titulo": "PhD en Medicina Homeopática",
                "pais": "USA"
            }
        ],
        "experiencia": "Dr. Zerquera lidera nuestro equipo con amplia experiencia en medicina integrativa, asegurando que todos los miembros colaboren eficazmente para apoyar sus objetivos de salud. Tiene experiencia integral en el manejo del dolor, utilizando diversas técnicas de la Medicina Oriental.",
        "filosofia": "En ZIMI estamos comprometidos a brindar atención excepcional a nuestros pacientes. Ofrecemos una amplia gama de terapias que satisfacen todas sus necesidades. Al combinar ejercicios de fisioterapia con técnicas tradicionales de acupuntura, encontraremos una solución que funcione mejor para usted.",
        "imagen": "https://drzerquera.com/wp-content/uploads/2024/02/drzerquera-banner-fondo-azul.avif"
    }

@api_router.get("/team")
async def get_team():
    return [
        {
            "nombre": "Dr. Pablo Zerquera",
            "titulo": "OMD, AP, PhD",
            "rol": "Director Médico",
            "especialidad": "Medicina Integrativa"
        },
        {
            "nombre": "Minsu Blanca",
            "titulo": "DPT",
            "rol": "Fisioterapeuta",
            "especialidad": "Fisioterapia"
        },
        {
            "nombre": "Felix Garcia", 
            "titulo": "PTA",
            "rol": "Asistente de Fisioterapia",
            "especialidad": "Terapia Física"
        }
    ]

@api_router.get("/insurance")
async def get_insurance():
    return {
        "seguros_aceptados": [
            "Ambetter",
            "Aetna", 
            "Careplus",
            "Doctor Health",
            "AvMed",
            "Oscar"
        ],
        "mensaje": "Aceptamos múltiples seguros médicos. Por favor contacte nuestra oficina para verificar su cobertura específica."
    }

@api_router.get("/contact-info")
async def get_contact_info():
    return {
        "telefono": "+1 305 274 4351",
        "whatsapp": "+1 954 669 8708",
        "email": "drzerquera@aol.com",
        "direccion": {
            "calle": "7700 N Kendall Dr. Unit 807",
            "ciudad": "Kendall",
            "estado": "FL",
            "codigo_postal": "33156",
            "pais": "USA"
        },
        "horarios": {
            "lunes_viernes": "9:00 AM - 6:00 PM",
            "sabado": "9:00 AM - 2:00 PM",
            "domingo": "Cerrado"
        },
        "redes_sociales": {
            "facebook": "https://www.facebook.com/p/Zerquera-Integrative-Medical-Institute-100055086833225/",
            "youtube": "https://www.youtube.com/@dr.pablozerquera5219"
        }
    }

@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment_data: AppointmentCreate):
    # Create patient ID for tracking
    patient_id = str(uuid.uuid4())
    
    appointment_dict = appointment_data.dict()
    appointment_dict["patient_id"] = patient_id
    
    appointment_obj = Appointment(**appointment_dict)
    
    # Save to database
    await db.appointments.insert_one(appointment_obj.dict())
    
    # Trigger admin notification
    try:
        # This would send real-time notification to admin
        logger.info(f"New appointment created: {appointment_obj.id} for patient {appointment_obj.patient_name}")
        
        # In production, you could send email, SMS, or push notification here
        # await send_admin_notification(appointment_obj)
        
    except Exception as e:
        logger.error(f"Failed to send admin notification: {e}")
    
    return appointment_obj

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments():
    appointments = await db.appointments.find().sort("created_at", -1).to_list(100)
    return [Appointment(**appointment) for appointment in appointments]

@api_router.put("/appointments/{appointment_id}/confirm")
async def confirm_appointment(appointment_id: str, telemedicine_link: Optional[str] = None):
    update_data = {
        "status": AppointmentStatus.CONFIRMADA,
        "confirmed_at": datetime.utcnow()
    }
    
    if telemedicine_link:
        update_data["telemedicine_link"] = telemedicine_link
    
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    
    return {"message": "Cita confirmada exitosamente"}

@api_router.post("/contact", response_model=Contact)
async def create_contact(contact_data: ContactCreate):
    contact_obj = Contact(**contact_data.dict())
    await db.contacts.insert_one(contact_obj.dict())
    return contact_obj

@api_router.get("/testimonials")
async def get_testimonials():
    return [
        {
            "nombre": "Natalie G",
            "rol": "Paciente",
            "testimonio": "He sido paciente del Dr. Zerquera durante varios años. Es extremadamente conocedor y meticuloso. Bajo su cuidado holístico, mi túnel carpiano y dolor de hombro está completamente curado. Continuaré recomendándolo a familiares y amigos.",
            "rating": 5
        },
        {
            "nombre": "Betti",
            "rol": "Paciente", 
            "testimonio": "Estoy muy feliz desde que comencé la terapia con el Dr. Zerquera. La acupuntura es una medicina natural fantástica, excelente trabajo del doctor. Es una persona muy profesional, y el ambiente se siente como familia. Me siento muy agradecida porque he tenido muy buenos resultados.",
            "rating": 5
        },
        {
            "nombre": "Mariela Carvajal",
            "rol": "Paciente",
            "testimonio": "Estoy emocionada con la terapia de ozono del Dr. Zerquera. Su experiencia y enfoque cariñoso han llevado a excelentes resultados. ¡Altamente recomendado!",
            "rating": 5
        }
    ]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()