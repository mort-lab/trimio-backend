# ✂️💈 **Trimio Backend** 💈✂️

¡Bienvenido a **Trimio**! 🚀 Esta es la plataforma definitiva para gestionar barberías de forma eficiente. Con **Trimio**, los barberos pueden gestionar citas, servicios, y estadísticas 📊 a través de un panel web, mientras que los clientes pueden encontrar barberías, reservar citas y pagar desde la comodidad de su móvil. 📱💳

---

## 📜 **Índice**

1. [Características Principales](#-características-principales)
2. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
3. [Estructura de la Base de Datos](#-estructura-de-la-base-de-datos)
4. [Endpoints de la API](#-endpoints-de-la-api)
5. [Guía de Instalación](#-guía-de-instalación)
6. [Cómo Usar el Proyecto](#-cómo-usar-el-proyecto)
7. [Pruebas](#-pruebas)
8. [Contribuciones](#-contribuciones)
9. [Licencia](#-licencia)

---

## ✨ **Características Principales**

- 📊 **Panel de Control para Barberos**: Gestión de citas, servicios y estadísticas.
- 📱 **App para Clientes**: Encuentra barberías, reserva citas y paga online.
- 💈 **Gestión Integral de Barberías**: Desde servicios hasta pagos.
- 🔒 **Seguridad**: Autenticación mediante tokens JWT, cifrado de contraseñas y pagos seguros con Stripe.
- 📈 **Estadísticas en Tiempo Real**: Ingresos, calificaciones y número de citas para cada barbero y barbería.

---

## 🛠 **Tecnologías Utilizadas**

- **Framework**: [NestJS](https://nestjs.com/) 🛡 - Un framework de Node.js para crear aplicaciones escalables y eficientes.
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/) 🐘 - Un potente sistema de base de datos relacional.
- **ORM**: [Prisma](https://www.prisma.io/) 🌐 - Un ORM moderno para trabajar con bases de datos.
- **Autenticación**: JWT (JSON Web Tokens) 🔐
- **Pagos**: [Stripe](https://stripe.com/) 💳 - Integración de pagos segura.

---

## 🗃 **Estructura de la Base de Datos**

La base de datos está organizada de forma relacional para optimizar el rendimiento y la integridad de los datos.

### 📦 **Tablas Principales**

- **Usuarios** (users) 👤: Almacena clientes, barberos y administradores.
- **Barberías** (barbershops) 💈: Información sobre las barberías.
- **Barberos** (barbers) ✂️: Barberos que trabajan en las barberías.
- **Servicios** (services) 💇‍♂️: Servicios ofrecidos por los barberos.
- **Citas** (appointments) 📅: Información sobre las citas de los clientes.
- **Pagos** (payments) 💸: Datos sobre los pagos procesados.
- **Estadísticas** (statistics) 📊: Información analítica sobre barberos y barberías.

---

## 🔌 **Endpoints de la API**

A continuación, se muestran los endpoints principales de la API REST construida con **NestJS**.

### 🔐 **Autenticación**

- POST /auth/register - Registro de nuevos usuarios.
- POST /auth/login - Inicio de sesión.
- POST /auth/refresh - Refrescar token JWT.

### 👥 **Usuarios**

- GET /users/profile - Obtener perfil del usuario.
- PUT /users/update-profile - Actualizar perfil.
- DELETE /users/delete-account - Eliminar cuenta de usuario.

### 💈 **Barberías**

- POST /barbershops - Crear una barbería.
- GET /barbershops/:id - Obtener detalles de una barbería.
- PUT /barbershops/:id - Actualizar una barbería.
- DELETE /barbershops/:id - Eliminar una barbería.

### ✂️ **Barberos**

- POST /barbers - Añadir un barbero.
- GET /barbers/:id - Obtener detalles de un barbero.
- GET /barbers/barbershop/:id - Listar barberos de una barbería.

### 💇‍♂️ **Servicios**

- POST /services - Crear un servicio.
- GET /services/:id - Obtener detalles de un servicio.
- GET /services/barber/:id - Listar servicios de un barbero.

### 📅 **Citas**

- POST /appointments - Reservar una cita.
- GET /appointments/:id - Obtener detalles de una cita.

### 💳 **Pagos**

- POST /payments - Procesar un pago.
- GET /payments/:id - Ver detalles de un pago.

### 📊 **Estadísticas**

- GET /statistics/barber/:id - Obtener estadísticas de un barbero.
- GET /statistics/barbershop/:id - Estadísticas de una barbería.

---

## 🛠 **Guía de Instalación**

### 🖥 **Requisitos Previos**

- [Node.js](https://nodejs.org/) (v16+)
- [PostgreSQL](https://www.postgresql.org/)

### ⚙️ **Pasos de Instalación**

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/tu-usuario/trimio-backend.git
   cd trimio-backend
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Crea un archivo .env en la raíz del proyecto y agrega las siguientes variables:

   ```bash
   DATABASE_URL=postgres://usuario:contraseña@localhost:5432/trimio
   JWT_SECRET=tu_secreto
   STRIPE_SECRET_KEY=tu_stripe_secret_key
   ```

4. **Correr migraciones de la base de datos**:

   ```bash
   npx prisma migrate dev
   ```

5. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run start:dev
   ```

¡Listo! 🎉 La API estará disponible en http://localhost:3000/api y puedes explorar la documentación con Swagger en http://localhost:3000/api.

---

## 🚀 **Cómo Usar el Proyecto**

### 💻 **Modo Desarrollo**

Inicia el servidor en modo desarrollo con monitoreo automático de cambios:

```bash
npm run start:dev
```

### 🏭 **Modo Producción**

Compila el proyecto y ejecuta en modo producción:

```bash
npm run build
npm run start:prod
```

---

## 🧪 **Pruebas**

### 📦 **Ejecutar Pruebas**

Ejecuta las pruebas unitarias y end-to-end (e2e) incluidas en el proyecto:

```bash
# Pruebas unitarias
npm run test

# Pruebas end-to-end
npm run test:e2e

# Cobertura de pruebas
npm run test:cov
```

---

## 🤝 **Contribuciones**

¡Las contribuciones son bienvenidas! Si deseas mejorar este proyecto, sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una rama de características (git checkout -b feature-nueva-caracteristica).
3. Haz tus cambios y realiza commits (git commit -m 'Agrega nueva característica').
4. Sube tus cambios (git push origin feature-nueva-caracteristica).
5. Abre un Pull Request para revisión.

---

## 📄 **Licencia**

Este proyecto está licenciado bajo la licencia MIT. Consulta el archivo LICENSE para obtener más información.

---

🌟 **Gracias por usar Trimio** 🌟

Si te gustó el proyecto, ¡no olvides dejar una ⭐ en el repositorio y compartirlo con tu equipo! 💬
