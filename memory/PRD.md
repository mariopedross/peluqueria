# Esther Pedrós · Salón de Belleza (PWA)

## Problema original
PWA mejorada, profesional, elegante y móvil; imágenes únicas por servicio con descripciones reales, sistema real de citas (BD + admin con login), logo minimalista.

## Arquitectura
- Backend: FastAPI + MongoDB (motor), JWT auth admin
- Frontend: React PWA (manifest + service worker), un único shell móvil
- Logo: SVG minimalista con monograma "EP" en tonos cobre/marrón

## Implementado (Ene 2026)
- Logo SVG elegante (`/logo.svg`) + manifest PWA + service worker offline
- 12 servicios reales con imagen Unsplash única, descripción específica, categoría, precio y duración
- Endpoint disponibilidad real con slots libres (excluye domingos, sábado horario corto)
- Booking 3 pasos: servicio → día/hora → datos. Persiste teléfono/nombre en localStorage
- Galería 10 trabajos reales con caption específico + lightbox
- "Mis Citas" por teléfono con cancelación
- Panel admin `/admin` con login, estadísticas (hoy, pendientes, confirmadas, total) y gestión completa (confirmar/completar/cancelar)
- Diseño cohesivo paleta nude/cobre, tipografías Cormorant Garamond + Inter, sin emojis-icono (lucide-react)
- Mobile-first (max-width 480px en cliente, 900px en admin)
- data-testid en todos los elementos clave

## Personas
- Clienta: reserva y consulta cita desde móvil
- Esther (staff): gestiona citas desde escritorio

## Backlog / Próximas mejoras
- P1: Notificaciones WhatsApp/email al confirmar cita (Twilio/SendGrid)
- P1: Recordatorios 24h antes
- P2: Carrusel de testimonios
- P2: Pago de seña con Stripe para reducir no-shows
