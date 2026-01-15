import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Text, Icon, useTheme} from '@ui-kitten/components';
import {ActivityIndicator} from 'react-native';
import ButtonK from '@shared-components/button/ButtonK';

interface PhotoStepProps {
  title: string;
  subtitle: string;
  loading: boolean;
  done: boolean;
  onTakePhoto: () => void;
  onNext: () => void;
  isLoading?: boolean;
  buttonTitle?: string;
  styles: any;
}

const PhotoStep: React.FC<PhotoStepProps> = ({
  title,
  subtitle,
  loading,
  done,
  onTakePhoto,
  onNext,
  isLoading = false,
  buttonTitle = 'Siguiente',
  styles: screenStyles,
}) => {
  const theme = useTheme();

  return (
    <>
      <Text category="h2" style={screenStyles.title}>
        {title}
      </Text>
      <Text category="s1" style={screenStyles.subtitle}>
        {subtitle}
      </Text>
      <View style={screenStyles.cameraButtonContainer}>
        <TouchableOpacity
          style={screenStyles.cameraButton}
          onPress={onTakePhoto}
          disabled={loading || done}>
          {loading ? (
            <View style={screenStyles.loadingContainer}>
              <ActivityIndicator
                size={40}
                color={theme['color-primary-500']}
              />
            </View>
          ) : done ? (
            <Icon
              name="checkmark-circle-2"
              fill="#4CAF50"
              style={screenStyles.iconSize}
            />
          ) : (
            <Icon
              name="camera"
              fill={theme['color-primary-500']}
              style={screenStyles.iconSize}
            />
          )}
        </TouchableOpacity>
        {loading && (
          <Text category="p1" style={screenStyles.processingText}>
            Procesando la imagen, esto puede tomar algunos segundos...
          </Text>
        )}
      </View>
      <ButtonK
        style={screenStyles.button}
        onPress={onNext}
        disabled={isLoading || !done}
        title={isLoading ? 'Cargando...' : buttonTitle}
      />
    </>
  );
};

export default PhotoStep;

