import React from 'react';
import {View, StyleSheet, Text, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const QrScanner: React.FC = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleScanQR = () => {
    // TODO: Implementar escaneo de QR
    console.log('Scan QR code');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <CurvedHeaderLayout
        title="Creditlvoo personal"
        showBackButton={true}
        onBackPress={handleBackPress}
        scroll={false}>
        <View style={styles.content}>
          <Text style={styles.instruction}>
            Coloca el código QR en el lector
          </Text>

          {/* <View style={styles.qrContainer}>
            <View style={styles.qrCodeWrapper}>
              <View style={styles.qrCode}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>
          </View> */}

          {/* <View style={styles.buttonContainer}>
            <Button
              onPress={handleScanQR}
              title="Scanear código QR"
              style={styles.scanButton}
            />
          </View> */}
        </View>
      </CurvedHeaderLayout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SCREEN_HEIGHT * 0.02,
    paddingBottom: SCREEN_WIDTH * 0.18,
  },
  instruction: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.05,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SCREEN_HEIGHT * 0.05,
  },
  qrCodeWrapper: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCode: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.65,
    backgroundColor: IVOO_COLORS.white,
    borderWidth: 1,
    borderColor: IVOO_COLORS.grayLight,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: IVOO_COLORS.black,
    borderWidth: 3,
  },
  topLeft: {
    top: -3,
    left: -3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -3,
    right: -3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -3,
    left: -3,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -3,
    right: -3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.06,
  },
  scanButton: {
    width: '100%',
  },
});

export default QrScanner;
