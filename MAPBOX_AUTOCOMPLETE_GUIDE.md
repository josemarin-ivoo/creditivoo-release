# Guía: Implementar Mapbox Autocomplete para Direcciones

## 📋 Pasos a Seguir

### 1. Obtener API Key de Mapbox

1. **Crear cuenta en Mapbox**
   - Visita https://www.mapbox.com
   - Crea una cuenta (es gratuita hasta cierto límite de uso)

2. **Generar Access Token**
   - Ve a tu cuenta → "Account" → "Access tokens"
   - Crea un nuevo token o copia uno existente
   - Asegúrate de que tenga permisos de geocoding/search

3. **Anotar el Token**
   - Guárdalo en un lugar seguro
   - Necesitarás usarlo en el siguiente paso

---

### 2. Configurar el Token en el Código

**Opción A: Hardcoded (solo para desarrollo)**
- Edita `src/ivoo/components/MapboxAutocomplete.tsx`
- Busca la línea: `const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN';`
- Reemplaza `YOUR_MAPBOX_ACCESS_TOKEN` con tu token real

**Opción B: Variables de entorno (recomendado para producción)**

1. Instala react-native-config (ya está instalado en tu proyecto)

2. Crea o edita `.env` en la raíz del proyecto:
   ```
   MAPBOX_ACCESS_TOKEN=tu_token_aqui
   ```

3. Crea o edita `.env.dev`:
   ```
   MAPBOX_ACCESS_TOKEN=tu_token_aqui
   ```

4. Actualiza `MapboxAutocomplete.tsx`:
   ```typescript
   import Config from 'react-native-config';
   const MAPBOX_ACCESS_TOKEN = Config.MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN';
   ```

5. En Android (`android/app/build.gradle`), agrega:
   ```gradle
   defaultConfig {
     // ... otras configuraciones
     resValue "string", "MAPBOX_ACCESS_TOKEN", MAPBOX_ACCESS_TOKEN
   }
   ```

---

### 3. Componente Creado

✅ El componente `MapboxAutocomplete` ya ha sido creado en:
- `src/ivoo/components/MapboxAutocomplete.tsx`

✅ Ya está exportado desde:
- `src/ivoo/components/index.ts`

---

### 4. Integración Completada

✅ El componente ya está integrado en:
- `src/ivoo/screens/credit-prepare/PersonalInfoFormScreen.tsx`

**Configuración actual:**
- País filtrado: Venezuela (`country="ve"`)
- Placeholder: "Buscar dirección..."
- Muestra sugerencias después de 3 caracteres
- Debounce de 500ms para evitar muchas peticiones

---

### 5. Configuración Opcional

**Cambiar el país de búsqueda:**
En `PersonalInfoFormScreen.tsx`, puedes cambiar el prop `country`:
```tsx
<MapboxAutocomplete
  country="co"  // Colombia
  // o
  country="mx"  // México
  // o
  country={undefined}  // Buscar en todo el mundo
/>
```

**Códigos de país comunes:**
- `ve` - Venezuela
- `co` - Colombia
- `mx` - México
- `ar` - Argentina
- `cl` - Chile
- `pe` - Perú
- `ec` - Ecuador

---

### 6. Probar la Implementación

1. **Ejecuta la app:**
   ```bash
   npm run android
   # o
   npm run ios
   ```

2. **Navega a:**
   - Perfil → Datos personales
   - O desde el flujo de registro/kyc

3. **Prueba el autocomplete:**
   - Escribe al menos 3 caracteres en el campo de dirección
   - Deberías ver sugerencias aparecer
   - Selecciona una sugerencia para autocompletar

---

### 7. Límites y Consideraciones

**Límites de Mapbox (plan gratuito):**
- 100,000 requests/mes
- Monitorear uso en el dashboard de Mapbox

**Costos:**
- Los primeros 100K requests son gratuitos
- Después: $0.75 por cada 1,000 requests adicionales

**Optimizaciones implementadas:**
- ✅ Debounce de 500ms
- ✅ Búsqueda mínima de 3 caracteres
- ✅ Límite de 5 resultados por búsqueda
- ✅ Idioma configurado en español

---

### 8. Solución de Problemas

**Error: "Por favor configura tu MAPBOX_ACCESS_TOKEN"**
- Verifica que el token esté configurado correctamente
- Revisa que el token tenga permisos de geocoding

**No aparecen sugerencias:**
- Verifica tu conexión a internet
- Revisa la consola para errores
- Asegúrate de escribir al menos 3 caracteres
- Verifica que el token sea válido en el dashboard de Mapbox

**Las sugerencias aparecen pero no se seleccionan:**
- Verifica que `onSelectAddress` esté funcionando
- Revisa los logs de la consola

---

### 9. Personalización Adicional

**Cambiar el debounce:**
En `MapboxAutocomplete.tsx`, busca `setTimeout` y ajusta el tiempo (en ms).

**Cambiar el límite de resultados:**
En `MapboxAutocomplete.tsx`, busca `&limit=5` y cambia el número.

**Cambiar el idioma:**
En `MapboxAutocomplete.tsx`, busca `&language=es` y cambia el código.

**Personalizar estilos:**
Edita los estilos en `MapboxAutocomplete.tsx` según tus necesidades.

---

## ✅ Checklist de Implementación

- [x] Componente MapboxAutocomplete creado
- [x] Componente exportado en index.ts
- [x] Integración en PersonalInfoFormScreen
- [ ] API Key de Mapbox obtenida
- [ ] API Key configurada en el código
- [ ] App probada en dispositivo/emulador
- [ ] Funcionalidad verificada

---

## 📚 Referencias

- [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/)
- [Mapbox Pricing](https://www.mapbox.com/pricing/)
- [Mapbox Access Tokens](https://docs.mapbox.com/accounts/guides/tokens/)

