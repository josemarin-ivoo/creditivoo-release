# Documentación de Pantallas - IVOO App

Este documento proporciona un resumen de todas las pantallas disponibles en `src/ivoo/screens`, organizadas por categorías funcionales.

---

## 🔐 Autenticación y Registro

### SplashScreen (`splash/SplashScreen.tsx`)

Pantalla inicial que se muestra al abrir la aplicación. Verifica el estado de autenticación del usuario y redirige automáticamente a Login o MainTabs según corresponda. Muestra el logo de Creditivoo durante 1.5 segundos mientras se realiza la verificación.

### LoginScreen (`login/LoginScreen.tsx`)

Pantalla de inicio de sesión con email y contraseña. Incluye autenticación biométrica (huella dactilar/Face ID) si hay credenciales guardadas. Permite navegar a registro y recuperación de contraseña. Valida credenciales y maneja errores de autenticación.

### RegisterScreen (`signup/RegisterScreen.tsx`)

Primera pantalla del flujo de registro. Solicita número telefónico venezolano (+58) con validación y aceptación de términos y condiciones. Envía código OTP por SMS al número proporcionado y navega a verificación OTP.

### OTPVerificationScreen (`signup/OTPVerificationScreen.tsx`)

Verifica el código OTP de 6 dígitos enviado por SMS durante el registro. Permite reenviar código con cooldown. Valida el código y navega a la siguiente pantalla del registro si es correcto.

### EmailInputScreen (`signup/EmailInputScreen.tsx`)

Solicita el correo electrónico del usuario durante el registro. Valida formato de email y requiere aceptación de política de fines comerciales. Envía código OTP por email y navega a verificación de email.

### EmailOTPVerificationScreen (`signup/EmailOTPVerificationScreen.tsx`)

Verifica el código OTP enviado por email. Similar a OTPVerificationScreen pero para verificación de email. Permite reenviar código y valida antes de continuar.

### PasswordScreen (`signup/PasswordScreen.tsx`)

Pantalla final del registro donde el usuario crea su contraseña. Muestra requisitos en tiempo real: 8-20 caracteres, mayúscula, número y caracter especial. Valida todos los requisitos antes de permitir continuar y completa el registro.

### RegistrationSuccessScreen (`signup/RegistrationSuccessScreen.tsx`)

Pantalla de confirmación después de registro exitoso. Muestra mensaje de felicitaciones e ilustración. Navega automáticamente a MainTabs después de completar el registro.

### ForgotPasswordScreen (`signup/ForgotPasswordScreen.tsx`)

Permite solicitar recuperación de contraseña ingresando email. Valida formato de email y envía código OTP para restablecimiento. Navega a pantalla de verificación OTP de recuperación.

### ForgotPasswordOTPScreen (`signup/ForgotPasswordOTPScreen.tsx`)

Verifica el código OTP enviado para recuperación de contraseña. Incluye countdown de expiración y cooldown para reenvío. Navega a ResetPasswordScreen después de verificación exitosa.

### ResetPasswordScreen (`signup/ResetPasswordScreen.tsx`)

Permite crear nueva contraseña después de verificar OTP. Muestra requisitos de contraseña en tiempo real y valida que ambas contraseñas coincidan. Actualiza contraseña y autentica al usuario automáticamente.

---

## 🏠 Pantallas Principales

### HomeCreditIvoo (`home/HomeCreditIvoo.tsx`)

Pantalla principal de la aplicación después del login. Muestra información de crédito disponible, tarjeta de crédito, compras recientes y acciones rápidas. Incluye pull-to-refresh y navegación a otras secciones principales.

### HomeCreditCard (`home/HomeCreditCard.tsx`)

Componente que muestra la tarjeta de crédito virtual del usuario. Muestra límite disponible, crédito usado y estado del crédito. Diseño visual similar a tarjeta física con gradientes.

### HomeHelpIvooAdvisor (`home/HomeHelpIvooAdvisor.tsx`)

Componente de ayuda integrado en el home. Muestra consejos y tips del asistente virtual Ivitoo. Proporciona información contextual sobre el uso de la app.

### QuickActions (`home/QuickActions.tsx`)

Componente de acciones rápidas en el home. Botones para escanear QR, ver compras, ver movimientos y otras acciones frecuentes. Navegación rápida a funciones principales.

---

## 👤 Perfil y Configuración

### ProfileScreen (`profile/ProfileScreen.tsx`)

Pantalla de perfil del usuario. Muestra foto de perfil, nombre, información personal y opciones de menú. Permite subir/cambiar foto de perfil, ver datos personales, términos, ayuda, configuración y cerrar sesión.

### SettingScreen (`settings/SettingScreen.tsx`)

Pantalla de configuración principal. Lista opciones de configuración disponibles: cambiar contraseña y seguridad. Navega a pantallas específicas según la opción seleccionada.

### ChangePasswordScreen (`settings/ChangePasswordScreen.tsx`)

Permite cambiar la contraseña del usuario autenticado. Requiere contraseña actual y nueva contraseña con validación de requisitos. Valida que la nueva contraseña cumpla todos los requisitos de seguridad.

### SecurityScreen (`settings/SecurityScreen.tsx`)

Pantalla de configuración de seguridad. Gestiona opciones relacionadas con seguridad de la cuenta. Puede incluir configuración de autenticación biométrica y otras opciones de seguridad.

---

## 💳 Crédito y Compras

### CreditValidationScreen (`credit-prepare/CreditValidationScreen.tsx`)

Pantalla de validación de crédito durante el proceso de asignación. Permite ingresar score de crédito para testing. Asigna crédito basado en el score y navega a confirmación.

### CreditConfirmationScreen (`credit-prepare/CreditConfirmationScreen.tsx`)

Confirma la asignación exitosa de crédito al usuario. Muestra detalles del crédito asignado y límite disponible. Navega al home después de la confirmación.

### PersonalInfoFormScreen (`credit-prepare/PersonalInfoFormScreen.tsx`)

Formulario para recopilar información personal del usuario. Solicita datos como nombre, apellido, fecha de nacimiento, documento de identidad. Valida y guarda información personal.

### ReferralCodeForm (`credit-prepare/ReferralCodeForm.tsx`)

Permite ingresar código de referido durante el proceso de registro/crédito. Valida formato del código y lo asocia con la cuenta del usuario.

### TermScreen (`credit-prepare/TermScreen.tsx`)

Muestra términos y condiciones que el usuario debe aceptar. Permite leer términos completos y aceptarlos para continuar con el proceso.

### PlanSelection (`plan/PlanSelection.tsx`)

Pantalla de selección de planes de financiamiento. Muestra diferentes planes disponibles según el grupo seleccionado. Permite seleccionar plan y crear compra con el plan elegido.

### PlanGroupSelection (`plan/PlanGroupSelection.tsx`)

Selección de grupo de planes antes de elegir plan específico. Agrupa planes por categorías y permite navegar a selección de plan individual.

### PurchaseConfirmationScreen (`plan/PurchaseConfirmationScreen.tsx`)

Confirma los detalles de la compra antes de finalizar. Muestra información de la compra, plan seleccionado y cuotas. Permite confirmar o cancelar la compra.

### PurchaseSuccessScreen (`plan/PurchaseSuccessScreen.tsx`)

Pantalla de éxito después de completar una compra. Muestra confirmación y detalles de la compra realizada. Navega al home o a detalles de la compra.

### SubscriptionSuccessScreen (`plan/SubscriptionSuccessScreen.tsx`)

Confirma suscripción exitosa a un plan Plus. Muestra beneficios de la suscripción y actualiza estado del usuario. Navega a pantalla principal después de confirmación.

### MyPurchasesScreen (`purchases/MyPurchasesScreen.tsx`)

Lista todas las compras realizadas por el usuario. Muestra compras con filtros por estado (pendiente, completada, cancelada). Permite ver detalles de cada compra y pull-to-refresh.

### PaymentInstallmentsScreen (`purchases/PaymentInstallmentsScreen.tsx`)

Muestra detalles de cuotas de una compra específica. Lista todas las cuotas con fechas de pago y estados. Permite ver historial de pagos y próximos vencimientos.

---

## 🎁 Gems y Puntos

### GemsScreen (`gem/GemsScreen.tsx`)

Pantalla principal de gems (puntos) del usuario. Muestra balance actual de gems, historial de transacciones y cómo ganar más gems. Incluye pull-to-refresh y navegación a pantalla de cómo ganar gems.

### HowToEarnGemsScreen (`gem/HowToEarnGemsScreen.tsx`)

Explica cómo el usuario puede ganar gems. Lista diferentes formas de obtener gems: compras, referidos, actividades, etc. Proporciona información detallada sobre el sistema de puntos.

---

## 🔍 Verificación y KYC

### IdentityVerificator (`kyc/IdentityVerificator.tsx`)

Pantalla principal de verificación de identidad (KYC). Muestra estado de documentos subidos: cédula frontal, cédula trasera y selfie. Permite subir documentos, verificar y reiniciar proceso KYC.

### IdFrontRequest (`kyc/IdFrontRequest.tsx`)

Solicita y captura foto de la parte frontal de la cédula. Maneja permisos de cámara, captura de imagen y subida al servidor. Valida calidad de imagen antes de subir.

### IdBackRequest (`kyc/IdBackRequest.tsx`)

Solicita y captura foto de la parte trasera de la cédula. Similar a IdFrontRequest pero para el reverso del documento. Valida y sube imagen al servidor.

### SelfieRequest (`kyc/SelfieRequest.tsx`)

Solicita y captura selfie del usuario para verificación. Valida que sea selfie en vivo y no foto de foto. Sube imagen para verificación facial.

---

## 📱 Funcionalidades Adicionales

### MovementsScreen (`movements/MovementsScreen.tsx`)

Muestra historial de movimientos financieros del usuario. Lista transacciones, pagos, recargas y otros movimientos. Incluye filtros por tipo y fecha, y pull-to-refresh.

### QrScanner (`scanner/QrScanner.tsx`)

Escáner de códigos QR para procesar compras. Solicita permisos de cámara, escanea QR y procesa información de compra. Navega a selección de plan después de escanear código válido.

### NotificationScreen (`notifications/NotificationScreen.tsx`)

Pantalla de notificaciones del usuario. Actualmente muestra estado vacío con mensaje "Aún no tienes notificaciones". Preparada para mostrar notificaciones cuando estén disponibles.

### HelpScreen (`help/HelpScreen.tsx`)

Pantalla de ayuda con preguntas frecuentes (FAQ). Muestra preguntas expandibles con respuestas. Incluye asistente virtual Ivitoo para ayuda adicional. Temas sobre uso de la app, crédito, pagos, etc.

---

## 📝 Notas Adicionales

- Todas las pantallas utilizan componentes reutilizables de `ivoo/components`
- La navegación se maneja mediante `@react-navigation/native`
- El estado global se gestiona con Redux Toolkit (`store`)
- Las pantallas de registro utilizan `RegisterLayout` para consistencia visual
- Las pantallas principales utilizan `CurvedHeaderLayout` para headers consistentes
- La validación de formularios se realiza principalmente con `yup`
- Las pantallas de autenticación incluyen manejo de errores y estados de carga
