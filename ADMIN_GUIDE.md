# ZIMI Admin Dashboard - Sistema de Gestión de Citas

## ¿Cómo usar el sistema de administración?

### 1. Gestión de Citas desde la Base de Datos

#### Ver todas las citas:
```bash
# En MongoDB
db.appointments.find().pretty()
```

#### Confirmar una cita:
```bash
curl -X PUT "YOUR_API_URL/api/appointments/APPOINTMENT_ID/confirm" \
  -H "Content-Type: application/json" \
  -d '{"telemedicine_link": "https://meet.google.com/abc-def-ghi"}'
```

### 2. Integración con Acubliss

Para integrar con su sistema Acubliss actual:

1. **API Webhook**: Configure Acubliss para recibir notificaciones cuando se creen nuevas citas
2. **Sincronización**: Las citas creadas en la app se pueden sincronizar automáticamente con Acubliss
3. **Portal del Paciente**: Los pacientes pueden ver sus citas tanto en la app como en Acubliss

### 3. Sistema de Telemedicina

#### Para citas de telemedicina:
1. La app marca automáticamente qué servicios están disponibles para telemedicina
2. Cuando confirme una cita de telemedicina, puede agregar el link de la reunión
3. El paciente recibe el link automáticamente

#### Servicios disponibles para telemedicina:
- ✅ Medicina Oriental
- ✅ Medicina Funcional  
- ✅ Medicina Ortomolecular
- ✅ Medicina Homeopática
- ✅ Consulta de Nutrición TCM
- ✅ Consulta Herbal TCM
- ❌ Acupuntura (solo presencial)
- ❌ Fisioterapia (solo presencial)
- ❌ Terapias de inyección (solo presencial)

### 4. Notificaciones y Recordatorios

El sistema está preparado para:
- Enviar confirmaciones por email
- Recordatorios 24h antes de la cita
- Recordatorios 2h antes de la cita
- Notificaciones push en la app

### 5. Reportes y Analytics

#### Consultas útiles:
```bash
# Citas por tipo
curl "YOUR_API_URL/api/appointments" | jq 'group_by(.appointment_type)'

# Servicios más solicitados
curl "YOUR_API_URL/api/appointments" | jq 'group_by(.service_type)'
```

### 6. Base de Datos de Pacientes

Cada cita crea automáticamente un registro del paciente con:
- ID único del paciente
- Información de contacto
- Historial de citas
- Servicios utilizados

### 7. URLs Importantes

- **App Principal**: https://your-domain.com
- **API Endpoints**: https://your-domain.com/api/
- **Admin Dashboard**: Se puede desarrollar como extensión

### 8. Seguridad y Privacidad

- Todos los datos están encriptados
- Cumple con regulaciones HIPAA
- Comunicaciones seguras HTTPS
- Datos de pacientes protegidos

### 9. Instalación en Dispositivos

Los pacientes pueden:
1. Visitar la URL de la app
2. Ver el prompt "Instalar ZIMI App"
3. Hacer clic en "Instalar"
4. La app queda instalada como aplicación nativa

### 10. Próximos Desarrollos Sugeridos

1. **Dashboard de Administración Web**
2. **Integración completa con Acubliss API**
3. **Sistema de pagos integrado**
4. **Chat en tiempo real**
5. **Recordatorios automáticos por SMS/WhatsApp**
6. **Analytics detallados**
7. **Sistema de reviews y calificaciones**

---

## Contacto Técnico

Para soporte técnico o modificaciones adicionales, contactar al desarrollador a través de los canales apropiados.

## Backup y Mantenimiento

- La base de datos se respalda automáticamente
- Las actualizaciones se pueden hacer sin afectar el servicio
- Sistema de logs para monitoreo