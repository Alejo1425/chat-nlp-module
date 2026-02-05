# Chat NLP Module - Interfaz de Chat Integrada

Interfaz de chat personalizada para asesores Auteco con extracción automática de datos mediante NLP.

## 🚀 Características

- **Chat en tiempo real** vía Evolution API (WhatsApp)
- **Extracción NLP** de datos del cliente (nombre, cédula, email, profesión, modelo de moto)
- **Integración CRM** para crear oportunidades con un click
- **Panel de inventario** de motocicletas Auteco integrado

## 📋 Requisitos

- Docker y Docker Compose
- Cuenta en Evolution API
- Acceso al CRM API

## 🛠️ Instalación

1. Clonar el repositorio
2. Copiar `.env.example` a `.env` y configurar las variables
3. Ejecutar:

```bash
docker-compose up -d
```

1. Acceder a `http://localhost`

## 📁 Estructura

```
chat-nlp-module/
├── backend/     # Express + Socket.IO
├── frontend/    # React + Vite
└── docker-compose.yml
```

## 🔧 Desarrollo

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

---
*Proyecto SAS - Auteco Asesores*
