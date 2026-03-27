# 🌠 PyGame_Proyect

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Pygame](https://img.shields.io/badge/Pygame-2.5-00B4B3?logo=python&logoColor=white)](https://www.pygame.org/)
[![Replit](https://img.shields.io/badge/Replit-Deployed-FF6C37?logo=replit&logoColor=white)](https://replit.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

## 🚀 Un Juego Arcade en la Nube

**Meteoritos Arcade** es un juego clásico de naves espaciales y asteroides... pero con un giro tecnológico único. Mientras el frontend está construido con **React + TypeScript**, el corazón del juego —físicas, colisiones y lógica— corre en **Python con Pygame**, todo orquestado en la nube mediante **Replit**.

> ✨ **¿El resultado?** Un híbrido técnico donde el frontend moderno se encuentra con la potencia clásica de Pygame.

## 🎮 Cómo Jugar

| Tecla | Acción |
|-------|--------|
| **←** | Mover nave a la izquierda |
| **→** | Mover nave a la derecha |
| **␣** | ¡Disparar! |

**Objetivo**: Destruye todos los meteoritos que caen. Cada impacto suma puntos. ¡Cuidado! Un solo choque y el juego termina.

## 🏗️ Arquitectura Técnica (Lo más interesante)

Este proyecto combina dos mundos que rara vez se encuentran:

```
┌─────────────────────────────────────────────────────┐
│                   NAVEGADOR                          │
│  ┌───────────────────────────────────────────────┐  │
│  │              React + TypeScript               │  │
│  │    • UI moderna con Radix UI                  │  │
│  │    • TailwindCSS para estilos                 │  │
│  │    • Vite para builds ultrarrápidas           │  │
│  └───────────────────────────────────────────────┘  │
│                         ↑                           │
│                         │ (WebSocket / API)         │
│                         ↓                           │
│  ┌───────────────────────────────────────────────┐  │
│  │              Python + Pygame                  │  │
│  │    • Lógica de juego completa                 │  │
│  │    • Sistema de colisiones                    │  │
│  │    • Control de disparos                      │  │
│  │    • Generación procedural de meteoritos      │  │
│  │    • Audio y efectos                          │  │
│  └───────────────────────────────────────────────┘  │
│                         ↑                           │
│                         ↓                           │
│  ┌───────────────────────────────────────────────┐  │
│  │              Replit Deployment                │  │
│  │    • Orquestación backend/frontend            │  │
│  │    • Hosting en la nube                       │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 🛠️ Tecnologías Utilizadas

### Frontend (React + TypeScript)

| Tecnología | Uso |
|------------|-----|
| **React 18** | Framework principal |
| **TypeScript** | Tipado estático |
| **Vite** | Build tool ultrarrápido |
| **Radix UI** | Componentes accesibles |
| **TailwindCSS** | Estilos utilitarios |
| **Framer Motion** | Animaciones fluidas |
| **Lucide React** | Iconos elegantes |
| **React Hook Form + Zod** | Validación de formularios |
| **TanStack Query** | Gestión de estado asíncrono |

### Backend (Python)

| Tecnología | Uso |
|------------|-----|
| **Python 3.12** | Lenguaje principal |
| **Pygame** | Motor de juego (físicas, colisiones, sprites, audio) |
| **Random / Time** | Generación procedural y temporización |

### Infraestructura

| Tecnología | Uso |
|------------|-----|
| **Replit** | Despliegue y orquestación full-stack |
| **Vite Preview** | Servicio del frontend |
| **Pygame Runtime** | Ejecución del backend en la nube |

## 📁 Estructura del Proyecto

```
meteoritos/
├── src/                      # Frontend React + TypeScript
│   ├── components/           # Componentes UI (Radix UI)
│   ├── App.tsx              # Componente principal
│   └── main.tsx             # Punto de entrada
├── python/                   # Backend Pygame
│   ├── meteoritos.py        # Lógica principal del juego
│   ├── clases/
│   │   ├── jugador.py       # Clase Nave
│   │   └── asteroides.py    # Clase Asteroide
│   ├── imagenes/            # Sprites y fondos
│   └── sonidos/             # Efectos de audio
├── package.json             # Dependencias frontend
├── vite.config.ts           # Configuración Vite
└── README.md                # Este archivo
```

## 🎯 Características del Juego

| Característica | Descripción |
|----------------|-------------|
| 🚀 **Movimiento fluido** | Control total de la nave con teclas ← → |
| 💥 **Sistema de disparos** | Disparos que destruyen meteoritos |
| 🌠 **Generación dinámica** | Asteroides aparecen aleatoriamente |
| 🔊 **Efectos de sonido** | Música de fondo + sonidos de colisión |
| 📊 **Puntuación en tiempo real** | Contador de puntos actualizado |
| 🎨 **Fondo animado** | Efecto parallax en movimiento |
| ❌ **Game Over** | Pantalla final con detención de audio |

## 🚀 Demo en Vivo

🎮 **¡Juega ahora!** → [https://game-deployer--salgadobarcenas.replit.app](https://game-deployer--salgadobarcenas.replit.app)

## 🤔 ¿Por qué esta arquitectura?

Este proyecto nació de una pregunta interesante: **¿Podemos hacer que Pygame —un motor tradicionalmente local— corra en la nube y se comunique con un frontend moderno en React?**

La respuesta fue un híbrido técnico que:
- ✅ Mantiene la potencia de Pygame para lógica de juego
- ✅ Ofrece una UI moderna con componentes accesibles
- ✅ Se despliega completamente en Replit sin configuración compleja
- ✅ Sirve como prueba de concepto de integración Python/JS

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si quieres mejorar el juego o agregar nuevas features:

1. Fork el repositorio
2. Crea tu rama (`git checkout -b feature/NuevaFeature`)
3. Commit tus cambios (`git commit -m 'Agrega nueva feature'`)
4. Push (`git push origin feature/NuevaFeature`)
5. Abre un Pull Request

## 📜 Licencia

MIT © [Astharmin](https://github.com/Astharmin)

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0f2a,100:1a1f3a&height=100&section=footer" />
</div>

---

⭐ **¿Te gustó el proyecto? ¡Dale una estrella en GitHub para apoyarlo!** ⭐
