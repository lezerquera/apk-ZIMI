from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
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
import base64

# Global variable to store doctor image (in production, this would be in database)
DOCTOR_IMAGE_DATA = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAFAAUADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8/KKKKACKKKACKKKAKKKKA"

# Pydantic models for request bodies
class DoctorImageUpdate(BaseModel):
    image_data: str

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

# Message System Models
class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str  # patient_id or 'admin'
    receiver_id: str  # patient_id or 'admin'
    sender_name: str
    receiver_name: str
    subject: str
    message: str
    is_read: bool = False
    message_type: str = "general"  # general, appointment, medical, reminder
    appointment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    read_at: Optional[datetime] = None

class MessageCreate(BaseModel):
    receiver_id: str
    receiver_name: str
    subject: str
    message: str
    message_type: str = "general"
    appointment_id: Optional[str] = None

class MessageReply(BaseModel):
    message: str

# Flyer Management Models
class ServiceFlyer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service_id: str
    title: str
    image_url: str
    benefits: List[str]
    conditions: List[str]
    process: List[str]
    safety: str
    duration: str
    frequency: str
    location: str
    contact_phone: str
    contact_website: str
    offer_title: Optional[str] = None
    offer_description: Optional[str] = None
    offer_price: Optional[str] = None
    offer_original_price: Optional[str] = None
    offer_savings: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FlyerCreate(BaseModel):
    service_id: str
    title: str
    image_url: str
    benefits: List[str]
    conditions: List[str]
    process: List[str]
    safety: str
    duration: str
    frequency: str
    location: str
    contact_phone: str
    contact_website: str
    offer_title: Optional[str] = None
    offer_description: Optional[str] = None
    offer_price: Optional[str] = None
    offer_original_price: Optional[str] = None
    offer_savings: Optional[str] = None

class FlyerUpdate(BaseModel):
    title: Optional[str] = None
    image_url: Optional[str] = None
    benefits: Optional[List[str]] = None
    conditions: Optional[List[str]] = None
    process: Optional[List[str]] = None
    safety: Optional[str] = None
    duration: Optional[str] = None
    frequency: Optional[str] = None
    location: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_website: Optional[str] = None
    offer_title: Optional[str] = None
    offer_description: Optional[str] = None
    offer_price: Optional[str] = None
    offer_original_price: Optional[str] = None
    offer_savings: Optional[str] = None

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

# Message system routes
@api_router.get("/messages/{user_id}", response_model=List[Message])
async def get_user_messages(user_id: str):
    messages = await db.messages.find({
        "$or": [{"sender_id": user_id}, {"receiver_id": user_id}]
    }).sort("created_at", -1).to_list(100)
    return [Message(**message) for message in messages]

@api_router.post("/messages", response_model=Message)
async def send_message(message_data: MessageCreate, sender_id: str, sender_name: str):
    message_dict = message_data.dict()
    message_dict["sender_id"] = sender_id
    message_dict["sender_name"] = sender_name
    
    message_obj = Message(**message_dict)
    await db.messages.insert_one(message_obj.dict())
    
    return message_obj

@api_router.put("/messages/{message_id}/read")
async def mark_message_read(message_id: str):
    result = await db.messages.update_one(
        {"id": message_id},
        {"$set": {"is_read": True, "read_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    
    return {"message": "Mensaje marcado como leído"}

@api_router.post("/messages/{message_id}/reply", response_model=Message)
async def reply_to_message(message_id: str, reply_data: MessageReply, sender_id: str, sender_name: str):
    # Get original message
    original_message = await db.messages.find_one({"id": message_id})
    if not original_message:
        raise HTTPException(status_code=404, detail="Mensaje original no encontrado")
    
    # Create reply
    reply_dict = {
        "sender_id": sender_id,
        "receiver_id": original_message["sender_id"],
        "sender_name": sender_name,
        "receiver_name": original_message["sender_name"],
        "subject": f"Re: {original_message['subject']}",
        "message": reply_data.message,
        "message_type": original_message["message_type"],
        "appointment_id": original_message.get("appointment_id")
    }
    
    reply_obj = Message(**reply_dict)
    await db.messages.insert_one(reply_obj.dict())
    
    return reply_obj

@api_router.get("/messages/unread/{user_id}")
async def get_unread_count(user_id: str):
    count = await db.messages.count_documents({
        "receiver_id": user_id,
        "is_read": False
    })
    return {"unread_count": count}

# Flyer management routes (Admin only)
@api_router.get("/flyers")
async def get_all_flyers():
    flyers = await db.flyers.find().to_list(100)
    return [ServiceFlyer(**flyer) for flyer in flyers]

@api_router.get("/flyers/{service_id}")
async def get_service_flyer(service_id: str):
    flyer = await db.flyers.find_one({"service_id": service_id})
    if not flyer:
        # Return default flyer structure
        return create_default_flyer(service_id)
    return ServiceFlyer(**flyer)

@api_router.post("/flyers", response_model=ServiceFlyer)
async def create_service_flyer(flyer_data: FlyerCreate):
    # Check if flyer already exists for this service
    existing = await db.flyers.find_one({"service_id": flyer_data.service_id})
    if existing:
        raise HTTPException(status_code=400, detail="Flyer ya existe para este servicio")
    
    flyer_obj = ServiceFlyer(**flyer_data.dict())
    await db.flyers.insert_one(flyer_obj.dict())
    return flyer_obj

@api_router.put("/flyers/{service_id}")
async def update_service_flyer(service_id: str, flyer_data: FlyerUpdate):
    update_data = {k: v for k, v in flyer_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.flyers.update_one(
        {"service_id": service_id},
        {"$set": update_data},
        upsert=True
    )
    
    if result.matched_count == 0 and result.upserted_id is None:
        raise HTTPException(status_code=404, detail="Error actualizando flyer")
    
    return {"message": "Flyer actualizado exitosamente"}

@api_router.delete("/flyers/{service_id}")
async def delete_service_flyer(service_id: str):
    result = await db.flyers.delete_one({"service_id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Flyer no encontrado")
    return {"message": "Flyer eliminado exitosamente"}

def create_default_flyer(service_id: str):
    """Create default flyer content for each service"""
    default_flyers = {
        "acupuntura": {
            "title": "Tratamientos de Acupuntura",
            "image_url": "https://via.placeholder.com/800x600/1e40af/ffffff?text=Acupuntura+ZIMI",
            "benefits": [
                "Alivio del dolor crónico y agudo",
                "Reducción del estrés y ansiedad",
                "Mejora de la calidad del sueño",
                "Fortalecimiento del sistema inmunológico",
                "Equilibrio energético del cuerpo"
            ],
            "conditions": [
                "Dolores de espalda y cuello",
                "Migrañas y dolores de cabeza",
                "Artritis y dolor articular",
                "Problemas digestivos",
                "Ansiedad y depresión",
                "Insomnio"
            ],
            "process": [
                "Consulta inicial y evaluación",
                "Diagnóstico según medicina tradicional china",
                "Inserción de agujas estériles en puntos específicos",
                "Sesión de 30-45 minutos de relajación",
                "Plan de tratamiento personalizado"
            ],
            "offer_title": "OFERTA ESPECIAL",
            "offer_description": "20 Sesiones de Acupuntura",
            "offer_price": "$1500",
            "offer_original_price": "$2000",
            "offer_savings": "Ahorra $500"
        },
        "medicina_oriental": {
            "title": "Medicina Oriental Tradicional",
            "image_url": "https://via.placeholder.com/800x600/059669/ffffff?text=Medicina+Oriental",
            "benefits": [
                "Enfoque holístico del cuerpo",
                "Tratamiento de la causa raíz",
                "Técnicas milenarias probadas",
                "Sin efectos secundarios",
                "Mejora del equilibrio interno"
            ],
            "conditions": [
                "Problemas digestivos crónicos",
                "Desequilibrios hormonales",
                "Fatiga crónica",
                "Problemas respiratorios",
                "Trastornos del sueño"
            ],
            "process": [
                "Evaluación según principios TCM",
                "Análisis de pulso y lengua",
                "Diagnóstico energético",
                "Plan de tratamiento integral",
                "Seguimiento personalizado"
            ]
        },
        "medicina_funcional": {
            "title": "Medicina Funcional Personalizada",
            "image_url": "https://via.placeholder.com/800x600/7c3aed/ffffff?text=Medicina+Funcional",
            "benefits": [
                "Enfoque personalizado único",
                "Identificación de causas raíz",
                "Prevención de enfermedades",
                "Optimización de la salud",
                "Tratamiento integral"
            ],
            "conditions": [
                "Enfermedades autoinmunes",
                "Síndrome metabólico",
                "Problemas hormonales",
                "Inflamación crónica",
                "Alergias alimentarias"
            ],
            "process": [
                "Evaluación funcional completa",
                "Análisis de laboratorio avanzado",
                "Identificación de desequilibrios",
                "Protocolo de tratamiento personalizado",
                "Monitoreo continuo de progreso"
            ]
        },
        "fisioterapia": {
            "title": "Fisioterapia Especializada",
            "image_url": "https://via.placeholder.com/800x600/dc2626/ffffff?text=Fisioterapia",
            "benefits": [
                "Recuperación de movilidad",
                "Fortalecimiento muscular",
                "Alivio del dolor",
                "Prevención de lesiones",
                "Mejora de la postura"
            ],
            "conditions": [
                "Lesiones deportivas",
                "Dolor de espalda",
                "Rehabilitación post-quirúrgica",
                "Problemas de postura",
                "Artritis y rigidez articular"
            ],
            "process": [
                "Evaluación física completa",
                "Análisis de movimiento",
                "Diseño de plan de ejercicios",
                "Terapia manual especializada",
                "Programa de mantenimiento"
            ]
        }
    }
    
    default_data = default_flyers.get(service_id, default_flyers["acupuntura"])
    
    return {
        "service_id": service_id,
        "safety": "Procedimiento completamente seguro realizado por profesionales certificados",
        "duration": "45-60 minutos por sesión",
        "frequency": "1-2 sesiones por semana inicialmente",
        "location": "7700 N Kendall Dr. Unit 807, Kendall, FL 33156",
        "contact_phone": "(305) 274-4351",
        "contact_website": "www.drzerquera.com",
        **default_data
    }

# Add route to serve doctor image
@api_router.get("/doctor-image/current")
async def get_current_doctor_image():
    """Serve the current doctor image"""
    # For now, return a placeholder or redirect to the uploaded image
    # In production, this would serve from a database or file storage
    import base64
    from fastapi.responses import Response
    
    # Base64 image data for Dr. Zerquera (you can replace this with the uploaded image)
    # This is a placeholder - in production you'd store the actual image
    image_data = """iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9Ddpe7gAAAABJRU5ErkJggg=="""
    
    # Convert base64 to bytes
    image_bytes = base64.b64decode(image_data)
    
    return Response(content=image_bytes, media_type="image/png")

# Add route to update doctor image (Admin only)
@api_router.post("/admin/doctor-image")
async def update_doctor_image(request: DoctorImageUpdate):
    """Update doctor image with base64 data"""
    global DOCTOR_IMAGE_DATA
    
    try:
        # Validate that we received image data
        if not request.image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # Validate base64 format (basic check)
        if not request.image_data.startswith('data:image/'):
            raise HTTPException(status_code=400, detail="Invalid image format. Must be a valid base64 image.")
        
        # Update the global variable (in production, this would update the database)
        DOCTOR_IMAGE_DATA = request.image_data
        
        print(f"✅ Doctor image updated successfully! Length: {len(request.image_data)} characters")
        
        return {
            "message": "Imagen del doctor actualizada exitosamente",
            "status": "success",
            "image_length": len(request.image_data),
            "updated": True
        }
        
    except Exception as e:
        print(f"❌ Error updating doctor image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating image: {str(e)}")

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
    global DOCTOR_IMAGE_DATA
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
        "imagen": DOCTOR_IMAGE_DATA  # Use stored image data
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
        "whatsapp": "+1 305 274 4351",
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