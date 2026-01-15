# Ivo Design System

Sistema de diseño centralizado para la aplicación Ivo BNPL, basado en los tokens de diseño de Figma.

## Estructura

```
ivoo/
├── config/          # Configuraciones y constantes de la app
├── screens/         # Pantallas de la aplicación
├── styles/          # Sistema de diseño (colores, tipografía, espaciado, sombras)
└── svgs/            # Componentes SVG en código
```

## Uso

### Importar el tema completo

```typescript
import {IVOO_THEME} from '@ivoo/styles';

// Usar colores
const color = IVOO_THEME.colors.primary;

// Usar tipografía
const fontSize = IVOO_THEME.typography.fontSize.xl;

// Usar espaciado
const margin = IVOO_THEME.spacing.lg;

// Usar sombras
const shadow = IVOO_THEME.shadows.button;
```

### Importar módulos específicos

```typescript
import {IVOO_COLORS} from '@ivoo/styles/colors';
import {IVOO_TYPOGRAPHY} from '@ivoo/styles/typography';
import {IVOO_SPACING} from '@ivoo/styles/spacing';
import {IVOO_SHADOWS, getShadowStyle} from '@ivoo/styles/shadows';
```

### Ejemplo de uso en un componente

```typescript
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  IVOO_COLORS,
  IVOO_TYPOGRAPHY,
  IVOO_SPACING,
  getShadowStyle,
} from '@ivoo/styles';

const MyComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola Ivo</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: IVOO_COLORS.background,
    padding: IVOO_SPACING.base,
    ...getShadowStyle('card'),
  },
  title: {
    fontSize: IVOO_TYPOGRAPHY.fontSize.xl,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    color: IVOO_COLORS.primary,
  },
});

export default MyComponent;
```

## Tokens de Diseño

### Colores

- **Primary**: `#0ADD73` - Color principal de la marca
- **White**: `#FFFFFF` - Fondo blanco
- **Black**: `#000000` - Texto principal
- Ver más en `styles/colors.ts`

### Tipografía

- **Fuentes**: Inter (Bold, SemiBold, Regular), Helvetica (Bold)
- **Tamaños**: xs (11px), sm (13px), base (15px), md (17.72px), lg (20px), xl (26px), 2xl (32px), 3xl (40px)
- Ver más en `styles/typography.ts`

### Espaciado

- Sistema basado en múltiplos de 4px
- Espaciados específicos de Figma incluidos
- Ver más en `styles/spacing.ts`

### Sombras

- **Button**: Sombra estándar para botones
- **Card**: Sombra para tarjetas
- **Small/Large**: Sombras adicionales
- Ver más en `styles/shadows.ts`

## Configuración

Las constantes de la aplicación se encuentran en `config/constants.ts`.

## SVG Components

Los componentes SVG se encuentran en `svgs/` y se pueden importar directamente como componentes de React Native.

### Uso de SVG

```typescript
import React from 'react';
import {View} from 'react-native';
import CreditivooLogo from '@ivoo/svgs/CreditivooLogo.svg';

const MyComponent = () => {
  return (
    <View>
      <CreditivooLogo width={300} height={46} />
    </View>
  );
};
```

O importar desde el index centralizado:

```typescript
import {CreditivooLogo, IvitooIllustration} from '@ivoo/svgs';
```

## Notas

- Todos los valores están basados en los tokens de diseño de Figma
- Los colores y espaciados siguen el sistema de diseño oficial
- Las sombras se adaptan automáticamente a iOS y Android
- Los SVG se transforman automáticamente en componentes gracias a `react-native-svg-transformer`
