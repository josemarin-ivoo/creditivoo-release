import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../styles';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Configuración - Reemplazar con tu API key de Mapbox
// TODO: Mover a variables de entorno usando react-native-config
const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoibGd1YXJlZ3VhIiwiYSI6ImNtanhiaGRnZDZpN3gzZXEzZzczaHM2ZmIifQ.MdWGIm5UkeMKMe2X_gVjXw'; // Reemplazar con tu token
const MAPBOX_SEARCH_API_URL =
  'https://api.mapbox.com/geocoding/v5/mapbox.places';

export interface MapboxAddress {
  id: string;
  placeName: string;
  address: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  context?: Array<{
    id: string;
    text: string;
    shortCode?: string;
  }>;
}

interface MapboxAutocompleteProps extends Omit<TextInputProps, 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  onSelectAddress?: (address: MapboxAddress) => void;
  containerStyle?: ViewStyle;
  error?: boolean;
  country?: string; // Código ISO del país (por defecto: 've' para Venezuela)
  placeholder?: string;
}

const MapboxAutocomplete: React.FC<MapboxAutocompleteProps> = ({
  value,
  onChangeText,
  onSelectAddress,
  containerStyle,
  error,
  country = 've', // Por defecto Venezuela
  placeholder = 'Buscar dirección...',
  ...textInputProps
}) => {
  const [suggestions, setSuggestions] = useState<MapboxAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const [containerLayout, setContainerLayout] = useState<{
    y: number;
    height: number;
  } | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<View>(null);

  // Función para buscar direcciones
  const searchAddresses = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);

    try {
      // Construir URL con parámetros
      let url = `${MAPBOX_SEARCH_API_URL}/${encodeURIComponent(
        query,
      )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=5&language=es&autocomplete=true`;

      // Agregar filtro por país si se especifica
      if (country) {
        url += `&country=${country}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.features && Array.isArray(data.features)) {
        const addresses: MapboxAddress[] = data.features.map((feature: any) => {
          const [longitude, latitude] = feature.geometry.coordinates;
          return {
            id: feature.id,
            placeName: feature.place_name,
            address: feature.place_name,
            coordinates: {
              longitude,
              latitude,
            },
            context: feature.context?.map((ctx: any) => ({
              id: ctx.id,
              text: ctx.text,
              shortCode: ctx.short_code,
            })),
          };
        });

        setSuggestions(addresses);
        if (addresses.length > 0) {
          // Medir posición antes de calcular dónde mostrar el panel
          handleContainerLayout();
          setShowSuggestions(true);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error('[MapboxAutocomplete] Error al buscar direcciones:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce para evitar demasiadas peticiones
  const handleTextChange = (text: string) => {
    onChangeText(text);

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Si el usuario borra el texto, ocultar sugerencias
    if (!text || text.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Buscar después de 500ms de inactividad
    debounceTimerRef.current = setTimeout(() => {
      searchAddresses(text);
    }, 500);
  };

  // Seleccionar una dirección
  const handleSelectAddress = (address: MapboxAddress) => {
    onChangeText(address.address);
    setShowSuggestions(false);
    setSuggestions([]);

    if (onSelectAddress) {
      onSelectAddress(address);
    }
  };

  // Calcular dónde mostrar el panel (arriba o abajo)
  const calculatePanelPosition = useCallback(() => {
    if (!containerLayout) {
      return;
    }

    const estimatedPanelHeight = SCREEN_HEIGHT * 0.3; // altura máxima estimada del panel
    const spaceBelow =
      SCREEN_HEIGHT - (containerLayout.y + containerLayout.height);
    const spaceAbove = containerLayout.y;

    // Si no hay suficiente espacio abajo pero sí arriba, mostrar arriba
    if (
      spaceBelow < estimatedPanelHeight &&
      spaceAbove > estimatedPanelHeight
    ) {
      setShowAbove(true);
    } else {
      setShowAbove(false);
    }
  }, [containerLayout]);

  // Medir posición del contenedor
  const handleContainerLayout = () => {
    if (containerRef.current) {
      containerRef.current.measureInWindow((_x, y, _width, height) => {
        setContainerLayout({y, height});
      });
    }
  };

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Recalcular posición cuando se muestran sugerencias
  useEffect(() => {
    if (showSuggestions && suggestions.length > 0) {
      calculatePanelPosition();
    }
  }, [showSuggestions, suggestions, calculatePanelPosition]);

  const renderSuggestionItem = ({item}: {item: MapboxAddress}) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectAddress(item)}
      activeOpacity={0.7}>
      <Icon
        name="location-on"
        type={IconType.MaterialIcons}
        size={20}
        color={IVOO_COLORS.primary}
        style={styles.suggestionIcon}
      />
      <View style={styles.suggestionTextContainer}>
        <Text style={styles.suggestionText} numberOfLines={2}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      ref={containerRef}
      style={[styles.container, containerStyle]}
      onLayout={handleContainerLayout}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#B4B4B4"
          onFocus={() => {
            handleContainerLayout();
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          {...textInputProps}
        />
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={IVOO_COLORS.primary} />
          </View>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View
          style={[
            styles.suggestionsContainer,
            showAbove
              ? styles.suggestionsContainerAbove
              : styles.suggestionsContainerBelow,
          ]}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            style={styles.suggestionsList}
            maxToRenderPerBatch={5}
            windowSize={5}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 1500,
    elevation: 1500,
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
  },
  input: {
    width: '100%',
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: 'rgba(110, 113, 124, 0.31)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: IVOO_COLORS.textPrimary,
    minHeight: SCREEN_HEIGHT * 0.065,
  },
  inputError: {
    borderColor: IVOO_COLORS.error,
  },
  loadingContainer: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(110, 113, 124, 0.31)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 1500,
    maxHeight: SCREEN_HEIGHT * 0.3,
    zIndex: 1501,
  },
  suggestionsContainerBelow: {
    top: '100%',
    marginTop: 4,
  },
  suggestionsContainerAbove: {
    bottom: '100%',
    marginBottom: 4,
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textPrimary,
    lineHeight: SCREEN_WIDTH * 0.05,
  },
});

export default MapboxAutocomplete;
