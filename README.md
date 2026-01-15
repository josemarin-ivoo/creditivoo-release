# Ivo BNPL App

Aplicación móvil de **Buy Now Pay Later (BNPL)** desarrollada por **Ivo**. Esta aplicación permite a los usuarios gestionar sus compras, pagos y financiamientos de manera sencilla e intuitiva.

## 📱 Descripción

Esta es una aplicación React Native que proporciona funcionalidades de financiamiento y gestión de pagos en cuotas. Los usuarios pueden:

- Ver y gestionar sus compras
- Seleccionar métodos de pago
- Realizar pagos de cuotas
- Ver historial de pagos
- Gestionar su perfil y cuenta

## 🏗️ Estructura del Proyecto

### Organización de Directorios

**Importante**: Todo el código relacionado con **Ivo** debe ir dentro del directorio `ivoo/`. Esta estructura permite mantener una separación clara del código específico de Ivo.

```
src/
├── app/                    # Componentes y features principales de la app
│   ├── assets/            # Recursos (fuentes, imágenes)
│   ├── components/        # Componentes reutilizables
│   ├── features/          # Features principales (auth, onboarding)
│   ├── services/          # Servicios (autenticación, validaciones)
│   └── styles/            # Estilos globales
├── assets/                # Assets compartidos (imágenes, SVGs)
├── components/            # Componentes de navegación
├── navigation/            # Configuración de navegación
├── screens/               # Pantallas de la aplicación
│   ├── customer-account/  # Pantallas de cuenta de cliente
│   ├── profile/           # Pantallas de perfil
│   └── ...
├── services/              # Servicios API y modelos
│   ├── api/               # Clientes API
│   └── models/            # Modelos de datos
├── shared/                # Componentes y utilidades compartidas
├── store/                 # Redux store y slices
└── utils/                 # Utilidades generales
```

### Directorio `ivoo/`

**Nota**: El directorio `ivoo/` está destinado a contener todo el código específico de Ivo. Actualmente, el código de Ivo está distribuido en la estructura actual, pero en futuras actualizaciones se migrará a este directorio para mantener una mejor organización.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS)
- CocoaPods (para iOS)

### Instalación

1. Clonar el repositorio:

```bash
git clone <repository-url>
cd ivoo-app-bnpl
```

2. Instalar dependencias:

```bash
npm install
# o
yarn install
```

3. Para iOS, instalar pods:

```bash
cd ios && pod install && cd ..
```

### Ejecutar la Aplicación

#### Android

```bash
npm run android
# o
yarn android
```

Para desarrollo con dispositivo específico:

```bash
npm run android:dev
```

#### iOS

```bash
npm run ios
# o
yarn ios
```

#### Metro Bundler

Iniciar el servidor Metro:

```bash
npm start
# o
yarn start
```

Para usar un puerto específico:

```bash
npm run metro
```

## 🛠️ Tecnologías Principales

- **React Native** 0.75.3
- **React** 18.3.1
- **TypeScript** 5.0.4
- **Redux Toolkit** - Gestión de estado
- **React Navigation** - Navegación
- **UI Kitten** - Componentes UI
- **Axios** - Cliente HTTP
- **React Hook Form** - Manejo de formularios
- **Firebase** - Notificaciones push
- **Moment.js** - Manejo de fechas

## 📂 Características Principales

### Autenticación

- Registro de usuarios
- Login con OTP
- Validación de documentos
- Onboarding

### Gestión de Compras

- Visualización de compras
- Detalles de compras y pagos
- Selección de pagos
- Filtros por estado (PASS_DUE, COMPLETED)

### Métodos de Pago

- Selección de método de pago
- Detalles de pago
- Confirmación de pagos
- Historial de transacciones

### Perfil

- Información personal
- Soporte al cliente
- FAQ
- Configuración

## 🔧 Scripts Disponibles

- `npm start` - Inicia Metro Bundler
- `npm run android` - Ejecuta en Android
- `npm run ios` - Ejecuta en iOS
- `npm run metro` - Inicia Metro en puerto 8084
- `npm run android:dev` - Ejecuta en dispositivo Android específico
- `npm run lint` - Ejecuta el linter
- `npm test` - Ejecuta los tests

## 📱 Estructura de Navegación

La aplicación utiliza React Navigation con:

- **Stack Navigator** - Para navegación principal
- **Tab Navigator** - Para navegación por pestañas
- **Auth Guard** - Para proteger rutas autenticadas

## 🎨 Estilos y Temas

Los estilos globales se encuentran en `src/app/styles/global.style.ts`. La aplicación utiliza:

- Fuentes personalizadas (Urbanist, Poppins, Raleway)
- Tema de UI Kitten con personalizaciones
- Colores consistentes en toda la aplicación

## 🔐 Seguridad

- Almacenamiento seguro con React Native Keychain
- Autenticación con tokens
- Validación de datos en formularios
- Manejo seguro de información sensible

## 📝 Convenciones de Código

- **Estilos**: Usar `StyleSheet.create` directamente, evitar `useMemo` para estilos
- **Componentes**: Componentes funcionales con TypeScript
- **Estado**: Redux Toolkit para estado global
- **Navegación**: React Navigation con tipos TypeScript
- **Iconos**: Usar `IconDynamic` de `react-native-dynamic-vector-icons`

## 🐛 Troubleshooting

### Problemas Comunes

1. **Metro no inicia**: Limpiar caché con `npm start -- --reset-cache`
2. **Errores de pods (iOS)**: Ejecutar `cd ios && pod install && cd ..`
3. **Errores de build Android**: Limpiar con `cd android && ./gradlew clean && cd ..`

## 📄 Licencia

Este proyecto es privado y propiedad de Ivo.

## 👥 Contribución

Este es un proyecto privado. Para contribuciones, contactar al equipo de desarrollo de Ivo.

---

**Desarrollado por Ivo** 🚀
