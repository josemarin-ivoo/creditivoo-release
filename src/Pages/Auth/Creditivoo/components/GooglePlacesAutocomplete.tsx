import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {GooglePlacesAutocomplete as RNGooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../styles';
import {Dimensions} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// TODO: Mover a variables de entorno
const GOOGLE_PLACES_API_KEY = 'AIzaSyA-9etTPiuNnN32eOnuOIklH3YW-npQJ4U'; // Reemplazar con tu API key

export interface GooglePlaceAddress {
  description: string;
  placeId: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlacesAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectAddress?: (address: GooglePlaceAddress) => void;
  containerStyle?: ViewStyle;
  error?: boolean;
  placeholder?: string;
}

const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  value,
  onChangeText,
  onSelectAddress,
  containerStyle,
  error,
  placeholder = 'Buscar dirección...',
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <RNGooglePlacesAutocomplete
        placeholder={placeholder}
        onPress={data => {
          onChangeText(data.description);
          if (onSelectAddress) {
            onSelectAddress({
              description: data.description,
              placeId: data.place_id,
              structured_formatting: data.structured_formatting,
            });
          }
        }}
        query={{
          key: GOOGLE_PLACES_API_KEY,
          language: 'es',
          components: 'country:ve', // Filtrar por Venezuela
        }}
        fetchDetails={false}
        enablePoweredByContainer={false}
        styles={{
          container: styles.autocompleteContainer,
          textInputContainer: styles.textInputContainer,
          textInput: [styles.textInput, error && styles.textInputError],
          listView: styles.listView,
          row: styles.row,
          separator: styles.separator,
          description: styles.description,
          predefinedPlacesDescription: styles.predefinedPlacesDescription,
        }}
        textInputProps={{
          value: value,
          onChangeText: onChangeText,
          placeholderTextColor: '#B4B4B4',
          returnKeyType: 'search',
        }}
        keyboardShouldPersistTaps="handled"
        listUnderlayColor="transparent"
        keepResultsAfterBlur={false}
        filterReverseGeocodingByTypes={[
          'locality',
          'administrative_area_level_3',
        ]}
        debounce={500}
        minLength={3}
        nearbyPlacesAPI="GooglePlacesSearch"
        GooglePlacesSearchQuery={{
          rankby: 'distance',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1500,
    elevation: 1500,
  },
  autocompleteContainer: {
    flex: 0,
    width: '100%',
    zIndex: 1500,
  },
  textInputContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  textInput: {
    width: '100%',
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: 'rgba(110, 113, 124, 0.31)',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: IVOO_COLORS.textPrimary,
    height: SCREEN_HEIGHT * 0.065,
  },
  textInputError: {
    borderColor: IVOO_COLORS.error,
  },
  listView: {
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(110, 113, 124, 0.31)',
    marginTop: 4,
    maxHeight: SCREEN_HEIGHT * 0.3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 1500,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  description: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textPrimary,
    flex: 1,
  },
  predefinedPlacesDescription: {
    color: IVOO_COLORS.textSecondary,
  },
});

export default GooglePlacesAutocomplete;
