# Guía para Subir Actualización a Google Play Store

## 📋 Versiones Actualizadas

- **versionCode**: 17 → **18** (obligatorio incrementar para cada release)
- **versionName**: 1.0.12 → **1.0.13**
- **package.json**: 0.0.1 → **0.0.2**

---

## 🔨 Paso 1: Generar el APK/AAB Firmado

### Opción A: Generar AAB (Recomendado por Google Play)

```bash
cd android
./gradlew bundleRelease
```

El archivo se generará en: `android/app/build/outputs/bundle/release/app-release.aab`

### Opción B: Generar APK (Alternativa)

```bash
cd android
./gradlew assembleRelease
```

El archivo se generará en: `android/app/build/outputs/apk/release/app-release.apk`

**Nota**: Google Play prefiere AAB porque permite optimizaciones automáticas por dispositivo.

---

## 🔐 Paso 2: Verificar la Firma

Asegúrate de que el build esté firmado con el keystore de producción:

- **Keystore**: `android/app/cuota-upload.jks`
- Las credenciales están configuradas en `android/gradle.properties`:
  - `CREDITIVOO_UPLOAD_STORE_FILE`
  - `CREDITIVOO_UPLOAD_STORE_PASSWORD`
  - `CREDITIVOO_UPLOAD_KEY_ALIAS`
  - `CREDITIVOO_UPLOAD_KEY_PASSWORD`

### ⚠️ Si el Keystore no existe

Si recibes el error `Keystore file not found`, el keystore se ha creado automáticamente con las credenciales por defecto.

**IMPORTANTE**: Si ya tienes una app publicada en Play Store, NO uses este keystore nuevo. Necesitas el keystore original que se usó para firmar la primera versión. Si usas un keystore diferente, no podrás actualizar la app existente.

**Si es una app nueva o puedes crear un keystore nuevo:**

- El keystore `cuota-upload.jks` ya ha sido creado
- Las contraseñas actuales son: `password` (cambiar por seguridad en producción)
- Para cambiar las contraseñas, edita `android/gradle.properties`

---

## 📱 Paso 3: Subir a Google Play Console

### 3.1. Acceder a Google Play Console

1. Ve a [Google Play Console](https://play.google.com/console)
2. Inicia sesión con la cuenta de desarrollador
3. Selecciona la app **creditivoo** (o el nombre de tu app)

### 3.2. Crear Nueva Versión

1. En el menú lateral, ve a **Producción** (o **Prueba interna/cerrada** si es para testing)
2. Haz clic en **Crear nueva versión**
3. Ingresa el **número de versión**: `1.0.13` (debe coincidir con `versionName`)

### 3.3. Subir el AAB/APK

1. En la sección **Archivos de la app**, haz clic en **Subir**
2. Selecciona el archivo generado:
   - `app-release.aab` (recomendado)
   - O `app-release.apk` (alternativa)
3. Espera a que se procese (puede tardar unos minutos)

### 3.4. Completar Información de la Versión

1. **Notas de la versión**: Describe los cambios de esta actualización

   ```
   Ejemplo:
   - Mejoras en la pantalla de seguridad
   - Corrección de bugs
   - Optimizaciones de rendimiento
   ```

2. **Revisar cambios**: Verifica que todos los cambios estén correctos

### 3.5. Revisar y Publicar

1. Revisa toda la información de la versión
2. Haz clic en **Revisar versión**
3. Si todo está correcto, haz clic en **Iniciar publicación a producción**

---

## ⚠️ Consideraciones Importantes

### VersionCode

- **DEBE** incrementarse en cada release
- Debe ser mayor que la versión anterior en Play Store
- Actual: **18** (ya incrementado)

### VersionName

- Es el número de versión visible para los usuarios
- Puede seguir cualquier formato (1.0.13, 1.1.0, etc.)
- Actual: **1.0.13** (ya incrementado)

### Testing Recomendado

Antes de publicar a producción, considera:

1. **Prueba interna**: Sube a "Prueba interna" primero
2. **Prueba cerrada**: Prueba con un grupo pequeño de usuarios
3. **Prueba abierta**: Prueba con un grupo más grande
4. **Producción**: Publica cuando estés seguro

---

## 🚀 Proceso Rápido (Resumen)

```bash
# 1. Generar AAB firmado
cd android
./gradlew bundleRelease

# 2. El archivo estará en:
# android/app/build/outputs/bundle/release/app-release.aab

# 3. Subir a Play Console:
# - Ir a play.google.com/console
# - Seleccionar app
# - Producción > Crear nueva versión
# - Subir app-release.aab
# - Completar notas de versión
# - Revisar y publicar
```

---

## 📝 Checklist Pre-Release

- [ ] Versiones incrementadas (versionCode y versionName)
- [ ] Build de release generado y probado localmente
- [ ] AAB/APK firmado correctamente
- [ ] Notas de versión preparadas
- [ ] Cambios probados en dispositivo físico
- [ ] Sin errores críticos conocidos
- [ ] Backup del keystore verificado

---

## 🔍 Verificar Versión en el Build

Para verificar que la versión es correcta antes de subir:

```bash
# Ver información del AAB
bundletool build-apks --bundle=app-release.aab --output=app.apks --mode=universal
unzip -l app.apks | grep base.apk
```

O instala el APK en un dispositivo y verifica la versión en Configuración > Apps.

---

## 📞 Soporte

Si encuentras problemas durante el proceso:

1. Verifica que las credenciales del keystore sean correctas
2. Asegúrate de que el versionCode sea mayor que la versión actual en Play Store
3. Revisa los logs de build para errores
4. Consulta la [documentación oficial de Google Play](https://support.google.com/googleplay/android-developer)

---

**Última actualización**: Versión 1.0.13 (versionCode 18)
