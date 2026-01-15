import React, {useMemo} from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {Tenant} from '@services/api/tenants';
import {Divider, Icon, Layout, useTheme} from '@ui-kitten/components';
import {SafeAreaView} from 'react-native-safe-area-context';
import createStyles from './BranchDetailScreen.style';

type BranchDetailRouteParams = {
  tenant: Tenant;
};

type BranchDetailRouteProp = RouteProp<
  {BranchDetail: BranchDetailRouteParams},
  'BranchDetail'
>;

const BranchDetailScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const route = useRoute<BranchDetailRouteProp>();
  const navigation = useNavigation();
  const {tenant} = route.params;

  const handleGetDirections = () => {
    if (tenant.latitude && tenant.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${tenant.latitude},${tenant.longitude}`;
      Linking.openURL(url).catch(err =>
        console.error('Error opening maps:', err),
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#ffffff" />
      <Layout style={styles.layout}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <View style={styles.backButtonCircle}>
              <Icon
                name="arrow-back"
                pack="eva"
                style={styles.backIcon}
                fill="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>IVOO</Text>
              <Text style={styles.logoSubtext}>APP</Text>
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.branchTitle}>{tenant.name}</Text>
            {tenant.address && (
              <View style={styles.locationRow}>
                <Icon
                  name="pin-outline"
                  pack="eva"
                  style={styles.locationIcon}
                  fill={theme['text-hint-color'] || '#999999'}
                />
                <Text style={styles.branchState}>{tenant.address}</Text>
              </View>
            )}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {/* Information Card */}
          <View style={styles.infoCard}>
            {/* Ubicación */}
            {tenant.address && (
              <>
                <Text style={styles.sectionTitle}>Ubicación</Text>
                <Text style={styles.sectionContent}>{tenant.address}</Text>
                <Divider style={styles.divider} />
              </>
            )}

            {/* Horario de atención */}
            <>
              <Text style={styles.sectionTitle}>Horario de atención</Text>
              <Text style={styles.sectionContent}>
                Lunes a Domingo 9:00am a 6:00pm
              </Text>
              <Divider style={styles.divider} />
            </>

            {/* Correo electrónico */}
            <View style={styles.emailSection}>
              <Text style={styles.sectionTitle}>Correo electrónico</Text>
              <Text style={styles.sectionContent}>contacto@ivoo.com</Text>
              {tenant.latitude && tenant.longitude && (
                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={handleGetDirections}>
                  <Icon
                    name="paper-plane-outline"
                    pack="eva"
                    style={styles.directionsIcon}
                    fill={theme['color-primary-500'] || '#4CAF50'}
                  />
                  <Text style={styles.directionsButtonText}>Cómo llegar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
};

export default BranchDetailScreen;
