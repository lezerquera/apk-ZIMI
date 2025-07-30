# ZIMI Notification Sounds

## Available Sounds:

1. **classic.mp3** - 🔔 Sonido clásico de notificación
2. **chime.mp3** - 🎵 Campanita suave 
3. **alert.mp3** - 📢 Alerta audible
4. **melody.mp3** - 🎶 Melodía corta
5. **urgent.mp3** - ⚡ Sonido urgente

## Usage:
Los sonidos se cargan automáticamente desde `/sounds/` cuando el administrador recibe notificaciones.

## Fallback:
Si los archivos de sonido no están disponibles, el sistema usa notificaciones visuales solamente.

## Configuration:
- Volume: 0.0 - 1.0 (adjustable by admin)
- Default: chime.mp3 at 70% volume
- Auto-play when new appointments are received