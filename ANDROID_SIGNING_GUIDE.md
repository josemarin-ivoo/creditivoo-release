# Guía para Firmar la App Android - creditivoo

## Paso 1: Crear un nuevo archivo JKS (Java KeyStore)

Abre una terminal en la carpeta `android/app` y ejecuta:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore creditivoo-release.jks -alias creditivoo-key -keyalg RSA -keysize 2048 -validity 10000
```

**Información que te pedirá:**

- **Contraseña del keystore**: (guárdala en un lugar seguro, la necesitarás)
- **Confirmar contraseña**: (la misma)
- **Nombre y apellido**: (ej: Creditivoo)
- **Unidad organizativa**: (ej: Development)
- **Organización**: (ej: Creditivoo)
- **Ciudad o localidad**: (ej: Ciudad)
- **Estado o provincia**: (ej: Provincia)
- **Código de país**: (ej: PA para Panamá, MX para México, etc.)
- **Contraseña de la clave**: (puede ser la misma que el keystore o diferente)

**⚠️ IMPORTANTE:**

- Guarda TODAS las contraseñas en un lugar seguro
- El archivo `.jks` NO debe subirse a Git (debe estar en `.gitignore`)
- Si pierdes el archivo JKS o las contraseñas, NO podrás actualizar la app en Google Play

---

## Paso 2: Mover el archivo JKS a la ubicación correcta

El archivo `creditivoo-release.jks` debe estar en:

```
android/app/creditivoo-release.jks
```

---

## Paso 3: Actualizar gradle.properties

Edita el archivo `android/gradle.properties` y actualiza estas líneas:

```properties
CUOTAVAR_UPLOAD_STORE_FILE=creditivoo-release.jks
CUOTAVAR_UPLOAD_KEY_ALIAS=creditivoo-key
CUOTAVAR_UPLOAD_STORE_PASSWORD=TU_CONTRASEÑA_DEL_KEYSTORE
CUOTAVAR_UPLOAD_KEY_PASSWORD=TU_CONTRASEÑA_DE_LA_CLAVE
```

**Reemplaza:**

- `TU_CONTRASEÑA_DEL_KEYSTORE` con la contraseña que usaste al crear el JKS
- `TU_CONTRASEÑA_DE_LA_CLAVE` con la contraseña de la clave (si es diferente)

---

## Paso 4: Verificar que el JKS no esté en Git

Asegúrate de que `android/app/*.jks` esté en `.gitignore`:

```bash
# Verificar .gitignore
cat .gitignore | grep jks
```

Si no está, agrega esta línea a `.gitignore`:

```
*.jks
android/app/*.jks
```

---

## Paso 5: Generar el APK firmado

### Opción A: APK de Release

```bash
cd android
./gradlew assembleRelease
```

El APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

### Opción B: AAB (Android App Bundle) - Para Google Play

```bash
cd android
./gradlew bundleRelease
```

El AAB estará en: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Paso 6: Verificar la firma del APK/AAB

Para verificar que el APK está correctamente firmado:

```bash
# Para APK
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk

# Para AAB (necesitas bundletool)
# Primero convierte AAB a APK para verificar
bundletool build-apks --bundle=android/app/build/outputs/bundle/release/app-release.aab --output=app.apks --ks=android/app/creditivoo-release.jks --ks-pass=pass:TU_CONTRASEÑA --ks-key-alias=creditivoo-key
```

---

## Información del Keystore Actual

**Archivo actual:** `app-release.jks`
**Alias actual:** `cuotaapp-release-key`

**⚠️ Si ya tienes una app publicada en Google Play:**

- NO puedes cambiar el keystore sin perder la capacidad de actualizar la app
- Si necesitas cambiar el keystore, tendrás que publicar como una app completamente nueva

---

## Comandos Rápidos

```bash
# 1. Crear JKS
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore creditivoo-release.jks -alias creditivoo-key -keyalg RSA -keysize 2048 -validity 10000

# 2. Generar APK firmado
cd ../..
cd android
./gradlew assembleRelease

# 3. Generar AAB firmado (para Play Store)
./gradlew bundleRelease

# 4. Limpiar build anterior
./gradlew clean
```

---

## Troubleshooting

### Error: "Keystore file does not exist"

- Verifica que el archivo `.jks` esté en `android/app/`
- Verifica que el nombre en `gradle.properties` coincida exactamente

### Error: "Password was incorrect"

- Verifica las contraseñas en `gradle.properties`
- Asegúrate de que no haya espacios extra

### Error: "Key alias does not exist"

- Verifica que el alias en `gradle.properties` coincida con el usado al crear el JKS
- Lista los aliases: `keytool -list -v -keystore android/app/creditivoo-release.jks`

---

## Seguridad

1. **NUNCA** subas el archivo `.jks` a Git
2. **NUNCA** compartas las contraseñas públicamente
3. Guarda una copia de seguridad del `.jks` en un lugar seguro
4. Documenta las contraseñas en un gestor de contraseñas seguro
