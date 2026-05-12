# Esther Pedrós Salón de Belleza - PWA

## Problema Original
Crear PWA profesional para el salón de belleza "Esther Pedrós". Aplicación de reservas con backend real, panel admin, notificación automática por WhatsApp al dueño, paleta blanco/rosa, imágenes reales de los servicios.

## Stack
- Frontend: React (PWA con manifest + service-worker)
- Backend: FastAPI + MongoDB (motor async)
- Notificaciones: Twilio WhatsApp Sandbox (notifica al dueño)
- Auth Admin: JWT + bcrypt
- Hosting: Emergent (preview + deploy)

## Contacto
- WhatsApp dueño: +34 622 927 352
- Email admin: mariopedrosgarcia123@gmail.com

## Funcionalidades implementadas
- [x] Catálogo de 13 servicios con imágenes reales (Feria, Trenzas, Bob, etc.)
- [x] Sistema de reservas con check de slots ocupados
- [x] Validación de disponibilidad por día (cerrado los domingos)
- [x] Cancelación de citas por cliente (vía teléfono)
- [x] Login admin JWT (email + password desde .env)
- [x] Panel admin: listado, filtros, actualización de estado, estadísticas
- [x] PWA: manifest + service-worker + logo SVG elegante
- [x] Paleta blanco/rosa
- [x] **Twilio Sandbox WhatsApp**: notificación automática al dueño cuando un cliente reserva (12/05/2026)

## Backlog
### P1
- Compartir cita por Instagram Stories (botón post-reserva)
- Recordatorio 24h antes de la cita (cron + Twilio)
- Notificación al cliente al confirmar/cancelar la cita desde admin

### P2
- Galería de trabajos previos por servicio
- Reseñas/testimonios
- Programa de fidelización (descuento a la 5ª visita)
- Migrar de Sandbox a número WhatsApp Business verificado (cuando ventas justifiquen coste)

## Endpoints
- `GET /api/services` - Lista servicios
- `GET /api/availability?date_str=YYYY-MM-DD` - Slots disponibles
- `POST /api/appointments` - Crear cita (envía WhatsApp al dueño)
- `GET /api/appointments/by-phone/{phone}` - Citas por cliente
- `DELETE /api/appointments/{id}?phone=X` - Cancelar
- `POST /api/admin/login` - Login admin
- `GET /api/admin/appointments` - Listado (con filtro `status`)
- `PATCH /api/admin/appointments/{id}` - Cambiar estado
- `GET /api/admin/stats` - Métricas dashboard

## Esquema appointments (MongoDB)
`{id, name, phone, email, service_id, service_name, date, time, notes, status, created_at}`

## ENV requeridos (backend)
- `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`, `JWT_SECRET`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `OWNER_WHATSAPP_TO`
- `SALON_WHATSAPP`

## Notas Twilio
- Está en **Sandbox** (limitación: solo destinatarios que enviaron `join park-nuts` reciben mensajes)
- El dueño ya está unido al Sandbox
- Para producción real sin esa limitación: aprobar plantillas y migrar a número WhatsApp Business
