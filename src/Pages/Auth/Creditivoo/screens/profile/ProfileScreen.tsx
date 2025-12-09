import React, {useMemo} from 'react';
import {ScrollView, View, TouchableOpacity} from 'react-native';
import {
  Divider,
  Icon,
  Layout,
  ListItem,
  Text,
  useTheme,
} from '@ui-kitten/components';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {AppDispatch} from 'store/store';
import {logout} from 'store/slices/auth-slice';
import {SCREENS} from '@shared-constants';
import createStyles from './ProfileScreen.style';

const sections = [
  {
    title: 'Mi cuenta',
    items: [
      {title: 'Información personal', icon: 'person-outline'},
      {title: 'Mis compras', icon: 'file-text-outline'},
    ],
  },
  {
    title: 'Soporte y ayuda',
    items: [
      {title: 'Preguntas frecuentes', icon: 'question-mark-circle-outline'},
      {title: 'Contactar a soporte', icon: 'headphones-outline'},
      {title: 'Valora nuestra app', icon: 'star-outline'},
    ],
  },
];

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const renderItemIcon = (props: any, name: string) => (
    <Icon
      {...props}
      name={name}
      fill={theme['color-primary-500'] || '#4CAF50'}
    />
  );

  const renderItemAccessory = (props: any) => (
    <Icon
      {...props}
      name="chevron-right-outline"
      fill={theme['text-hint-color'] || '#999999'}
    />
  );

  const handleItemPress = (itemTitle: string) => {
    switch (itemTitle) {
      case 'Información personal':
        navigation.navigate(SCREENS.PERSONAL_INFORMATION as never);
        break;
      case 'Preguntas frecuentes':
        navigation.navigate(SCREENS.FAQ as never);
        break;
      case 'Contactar a soporte':
        navigation.navigate(SCREENS.CONTACT_SUPPORT as never);
        break;
      case 'Mis compras':
        // TODO: Navigate to purchases screen when implemented
        console.log('[ProfileScreen] Mis compras - Not implemented yet');
        break;
      case 'Valora nuestra app':
        // TODO: Navigate to app rating when implemented
        console.log('[ProfileScreen] Valora nuestra app - Not implemented yet');
        break;
      default:
        console.log('[ProfileScreen] Item pressed:', itemTitle);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
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
            {/* <View style={styles.backButtonCircle}>
              <Icon name="arrow-back" fill="#FFFFFF" width={20} height={20} />
            </View> */}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi perfil</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {sections.map(section => (
            <View key={section.title} style={styles.sectionContainer}>
              <Text category="s1" style={styles.sectionTitle}>
                {section.title}
              </Text>
              <View style={styles.card}>
                {section.items.map((item, itemIndex) => (
                  <React.Fragment key={item.title}>
                    <ListItem
                      title={item.title}
                      accessoryLeft={props => renderItemIcon(props, item.icon)}
                      accessoryRight={renderItemAccessory}
                      onPress={() => handleItemPress(item.title)}
                    />
                    {itemIndex < section.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Logout Button - Fixed at bottom */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon
              name="log-out-outline"
              pack="eva"
              style={styles.logoutIcon}
              fill="#FF3D71"
            />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    </SafeAreaView>
  );
};

export default ProfileScreen;
