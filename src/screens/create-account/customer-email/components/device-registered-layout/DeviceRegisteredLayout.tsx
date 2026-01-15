import RegisteredInfo from '@shared-components/registered/RegisteredInfo';
import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import brandLogo from 'assets/img/XiaomiLogo.png';
import Brand from '@shared-components/brand/PurchaseItem';
import Button from '@shared-components/button/Button';

interface DeviceRegisteredLayoutProps {}

const DeviceRegisteredLayout: React.FC<DeviceRegisteredLayoutProps> = () => {
  return (
    <View style={styles.container}>
      <RegisteredInfo info />
      <View style={styles.brandContaier}>
        <Brand phoneBrand="Xiaomi" selectedModel="Xiaomi 14 - 256GB" />
      </View>
      <Button title="Continuar" onPress={() => {}} />
    </View>
  );
};

export default DeviceRegisteredLayout;

const styles = StyleSheet.create({
  container: {},
  brandContaier: {
    marginVertical: 12,
  },
});
