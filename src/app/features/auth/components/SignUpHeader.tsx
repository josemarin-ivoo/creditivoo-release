import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Icon, useTheme} from '@ui-kitten/components';
import IvooLogo from '../../../../assets/svgs/IvooLogo.svg';

interface SignUpHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}

const SignUpHeader: React.FC<SignUpHeaderProps> = ({
  currentStep,
  totalSteps,
  onBack,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.headerLogoContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon
            name="arrow-back"
            fill={theme['color-primary-500']}
            width={24}
            height={24}
          />
        </TouchableOpacity>
        <IvooLogo width={100} height={100} />
      </View>
      <View style={styles.progressBarContainer}>
        {Array.from({length: totalSteps}).map((_, index) => {
          const isActive = index < currentStep;
          return (
            <View
              key={index}
              style={[
                styles.progressSegment,
                isActive
                  ? [styles.progressSegmentActive, {backgroundColor: theme['color-primary-500']}]
                  : styles.progressSegmentInactive,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: -20,
    marginBottom: 25,
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 20,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  progressBarContainer: {
    marginTop: 20,
    flex: 1,
    flexDirection: 'row',
  },
  progressSegment: {
    flex: 1,
    height: 15,
    borderRadius: 25,
    marginHorizontal: 2,
  },
  progressSegmentActive: {
    // backgroundColor will be set via style prop
  },
  progressSegmentInactive: {
    backgroundColor: '#E0E0E0',
  },
});

export default SignUpHeader;

