import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import { getInitials } from 'utils';
import Icon, { IconType } from 'react-native-dynamic-vector-icons';
import { COLORS } from 'app/styles/global.style';

interface AvatarProps {
  imageUri?: string;
  size?: number;
  editable?: boolean;
  onEditPress?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  imageUri,
  size = 32,
  editable = false,
  onEditPress,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <View
      style={[
        styles.avatarContainer,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.avatarImage,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.initialsContainer,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <TextWrapper color="#FFF" fontSize={size * 0.35}>
            {getInitials(user?.name, user?.lastname)}
          </TextWrapper>
        </View>
      )}
      {editable && (
        <TouchableOpacity
          style={styles.editIconContainer}
          onPress={onEditPress}
        >
          <Icon
            type={IconType.MaterialIcons}
            name="edit"
            size={size * 0.2}
            color="#FFF"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBlue,
    position: 'relative', //Necessary to position the edit icon
  },
  avatarImage: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBlue,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: -3,
    right: 0,
    backgroundColor: '#159C5C', // Background color
    borderRadius: 50, // Ensure the background is round
    padding: 4, // Space around the icon
    borderWidth: 2,
    borderColor: '#FFF',
  },
});

export default Avatar;
