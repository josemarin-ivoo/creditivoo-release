import React, {useEffect, useMemo, useState} from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import {Icon, Layout, Text, useTheme} from '@ui-kitten/components';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from 'store/store';
import {updateMe, updateUserInfo} from 'store/slices/auth-slice';
import {User} from '@services/api/auth';
import createStyles from './PersonalInformationScreen.style';

const PersonalInformationScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {userMe, isLoading: isUpdating} = useSelector(
    (state: RootState) => state.auth,
  );
  const [user, setUser] = useState<User | null>(userMe);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch user data on mount
    setIsLoading(true);
    dispatch(updateMe())
      .then(result => {
        if (updateMe.fulfilled.match(result)) {
          setUser(result.payload);
          setEditedUser(result.payload);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const handleEdit = () => {
    setEditedUser(user);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedUser) return;

    try {
      const updateData: any = {};
      if (editedUser.name !== user?.name) updateData.name = editedUser.name;
      if (editedUser.lastname !== user?.lastname)
        updateData.lastname = editedUser.lastname;
      if (editedUser.phone !== user?.phone) updateData.phone = editedUser.phone;

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }

      const result = await dispatch(updateUserInfo(updateData));
      if (updateUserInfo.fulfilled.match(result)) {
        setUser(result.payload);
        setEditedUser(result.payload);
        setIsEditing(false);
        Alert.alert('Éxito', 'Información actualizada correctamente');
      } else {
        Alert.alert('Error', 'No se pudo actualizar la información');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo actualizar la información',
      );
    }
  };

  const renderItemIcon = (props: any, name: string) => (
    <Icon
      {...props}
      name={name}
      fill={theme['color-primary-500'] || '#4CAF50'}
      style={{width: 20, height: 20}}
    />
  );

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch {
      return dateString;
    }
  };

  const userFields = [
    {
      key: 'name',
      label: 'Nombre',
      value: isEditing ? editedUser?.name || '' : user?.name || 'No disponible',
      icon: 'person-outline',
      editable: true,
    },
    {
      key: 'lastname',
      label: 'Apellido',
      value: isEditing
        ? editedUser?.lastname || ''
        : user?.lastname || 'No disponible',
      icon: 'person-outline',
      editable: true,
    },
    {
      key: 'email',
      label: 'Email',
      value: user?.email || 'No disponible',
      icon: 'email-outline',
      editable: false,
      showVerification: true,
    },
    {
      key: 'phone',
      label: 'Teléfono',
      value: isEditing
        ? editedUser?.phone || ''
        : user?.phone || 'No disponible',
      icon: 'phone-outline',
      editable: true,
      keyboardType: 'phone-pad',
    },
    {
      key: 'document',
      label: 'Documento',
      value:
        user?.kycVerifications?.verificationData?.id_verification
          ?.document_number ||
        user?.document ||
        'No disponible',
      icon: 'file-text-outline',
      editable: false,
      showKycVerification:
        !!user?.kycVerifications?.verificationData?.id_verification
          ?.document_number,
    },
    {
      key: 'dob',
      label: 'Fecha de nacimiento',
      value: formatDate(user?.dob),
      icon: 'calendar-outline',
      editable: false,
    },
  ];

  const handleFieldChange = (key: string, value: string) => {
    if (!editedUser) return;
    setEditedUser({
      ...editedUser,
      [key]: value,
    });
  };

  const renderKycFields = (kycData: any) => {
    const kycFields = [];

    // Status
    if (kycData.status) {
      kycFields.push({
        key: 'kyc_status',
        label: 'Estado de verificación',
        value: kycData.status === 'Approved' ? 'Aprobado' : kycData.status,
        icon: 'shield-checkmark-outline',
      });
    }

    // Document Number from ID Verification
    if (kycData.id_verification?.document_number) {
      kycFields.push({
        key: 'kyc_document',
        label: 'Documento verificado',
        value: kycData.id_verification.document_number,
        icon: 'id-card-outline',
      });
    }

    // Document Type
    if (kycData.id_verification?.document_type) {
      kycFields.push({
        key: 'kyc_document_type',
        label: 'Tipo de documento',
        value: kycData.id_verification.document_type,
        icon: 'document-text-outline',
      });
    }

    // Liveness Score
    if (kycData.liveness?.score !== undefined) {
      kycFields.push({
        key: 'kyc_liveness',
        label: 'Puntuación de liveness',
        value: `${kycData.liveness.score}%`,
        icon: 'eye-outline',
      });
    }

    // Face Match Score
    if (kycData.face_match?.score !== undefined) {
      kycFields.push({
        key: 'kyc_face_match',
        label: 'Coincidencia facial',
        value: `${kycData.face_match.score.toFixed(2)}%`,
        icon: 'person-outline',
      });
    }

    // Created At
    if (kycData.created_at) {
      kycFields.push({
        key: 'kyc_created_at',
        label: 'Fecha de verificación',
        value: formatDate(kycData.created_at),
        icon: 'calendar-outline',
      });
    }

    return kycFields.map(field => (
      <View key={field.key} style={styles.fieldCard}>
        <View style={styles.fieldHeader}>
          <View style={styles.iconContainer}>
            {renderItemIcon({}, field.icon)}
          </View>
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <Text style={styles.fieldValue}>{field.value}</Text>
          </View>
        </View>
      </View>
    ));
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
          <Text style={styles.headerTitle}>Información personal</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme['color-primary-500'] || '#4CAF50'}
              />
            </View>
          ) : (
            <>
              {/* User Profile Image */}
              {user?.frontImage && (
                <View style={styles.profileImageContainer}>
                  <Image
                    source={{uri: user.frontImage}}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              {userFields.map((field, index) => (
                <View key={field.key} style={styles.fieldCard}>
                  <View style={styles.fieldHeader}>
                    <View style={styles.iconContainer}>
                      {renderItemIcon({}, field.icon)}
                    </View>
                    <View style={styles.fieldContent}>
                      <View style={styles.labelContainer}>
                        <Text style={styles.fieldLabel}>{field.label}</Text>
                        {field.showVerification && !isEditing && (
                          <View style={styles.verificationBadge}>
                            <Icon
                              name={
                                user?.isEmailVerified
                                  ? 'checkmark-circle'
                                  : 'close-circle'
                              }
                              pack="eva"
                              style={styles.verificationIcon}
                              fill={
                                user?.isEmailVerified ? '#4CAF50' : '#FF6B6B'
                              }
                            />
                            <Text
                              style={[
                                styles.verificationText,
                                user?.isEmailVerified
                                  ? styles.verificationTextVerified
                                  : styles.verificationTextNotVerified,
                              ]}>
                              {user?.isEmailVerified
                                ? 'Verificado'
                                : 'No verificado'}
                            </Text>
                          </View>
                        )}
                        {field.showKycVerification && !isEditing && (
                          <View style={styles.verificationBadge}>
                            <Icon
                              name="checkmark-circle"
                              pack="eva"
                              style={styles.verificationIcon}
                              fill="#4CAF50"
                            />
                            <Text
                              style={[
                                styles.verificationText,
                                styles.verificationTextVerified,
                              ]}>
                              Verificado
                            </Text>
                          </View>
                        )}
                      </View>
                      {isEditing && field.editable ? (
                        <TextInput
                          style={styles.fieldInput}
                          value={field.value}
                          onChangeText={value =>
                            handleFieldChange(field.key, value)
                          }
                          placeholder={`Ingresa ${field.label.toLowerCase()}`}
                          placeholderTextColor={
                            theme['text-hint-color'] || '#999999'
                          }
                          keyboardType={
                            (field.keyboardType as any) || 'default'
                          }
                          editable={!isUpdating}
                        />
                      ) : (
                        <Text style={styles.fieldValue}>{field.value}</Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
              {isEditing && (
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={styles.cancelButtonBottom}
                    disabled={isUpdating}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSave}
                    style={styles.saveButtonBottom}
                    disabled={isUpdating}>
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>Guardar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* KYC Information Section */}
              {user?.kycVerifications?.verificationData && (
                <View style={styles.kycSection}>
                  <Text style={styles.kycSectionTitle}>
                    Verificación de Identidad
                  </Text>
                  {renderKycFields(user.kycVerifications.verificationData)}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
};

export default PersonalInformationScreen;
