import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, Image, Dimensions, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button, Input} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {useIvoSelector, useIvoDispatch} from '../../../../../redux/useIvo';
import {assignCreditFromScoreThunk} from '../../store-creditivoo/credit-slice';
// import CredoAppService from '@credolab/react-core';
import {
  uploadDataset,
  requestInsightsWithPolling,
  extractScoreDummyFromInsights,
} from '../../../../../../credolabClient'

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const CreditValidationScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const {hasAssignedFromScore, isAssigning} = useIvoSelector(
    state => state.creditivoo.credit,
  );

 
  const [realScore, setRealScore] = useState<number | null>(null);
  
  const {user, isLoading} = useIvoSelector((state: any) => state.creditivoo.auth);

  const userId = user?.id || user?.uuid || "";
  //Alert.alert("Debug ID", `${userId || 'No encontrado'}`);

  const [debugScore, setDebugScore] = useState<string>('850');


  const onCredoCollectUpload = async () => {
    try {

      const ref = userId; // cargar idusuario

      //Alert.alert('CredoLab', `Collect + Upload\n${ref}`);

      const r = await uploadDataset(ref);

      const raw = typeof r.body === 'string' ? r.body : JSON.stringify(r.body, null, 2);

      
    } catch (e) {
      Alert.alert('CredoLab', `Error: ${String(e)}`);
    }
  };

  const onCredoRequestInsights = async () => {
    try {
      // Puedes cambiarlo por el último ref generado si quieres
      const ref = userId;

      const r = await requestInsightsWithPolling(ref, 8, 2000);

      const sd = extractScoreDummyFromInsights(r?.body);

      const scoreObtenido = sd?.score;

      if (scoreObtenido) {
      // --- CORRECCIÓN: USAR EL SETTER ---
        setRealScore(scoreObtenido); 
        //Alert.alert('Éxito', 'Análisis de crédito completado');
      }

      //enviarlo al backend
     
    } catch (e) {
      Alert.alert('CredoLab', `Error: ${String(e)}`);
    }
  };

  useEffect(() =>{

    if(userId){

      ejecutarProcesoCredo();
      

    }

  }, [userId]);

  const ejecutarProcesoCredo = async () => {
    //subo a credolab la info
      onCredoCollectUpload();
      // me extrae el score
      onCredoRequestInsights();
  };
  
  /* termina CredoLab (handlers de debug) */

  const handleContinue = async () => {

    const scoreParaEnviar = realScore !== null;
    
    // Si ya se asignó crédito, no volver a llamar al endpoint, solo navegar
    if (hasAssignedFromScore) {
      (navigation as any).navigate('CreditConfirmation');
      return;
    }
    const scoreFinal = realScore !== null 
    ? realScore 
    : (parseInt(debugScore, 10) || 850);


    try {
      // Enviamos el score al backend mediante el thunk
      await dispatch(assignCreditFromScoreThunk(scoreFinal)).unwrap();
      
      // Navegamos pasando el score para que la siguiente pantalla lo muestre
      (navigation as any).navigate('CreditConfirmation', { 
        scoreMostrado: scoreFinal 
      });
    } catch (error) {

      console.error('[CreditValidationScreen] Error:', error);

    }


    // // Obtener el score desde el input de debug (testing score manual)
    // const scoreInput = parseInt(debugScore, 10);
    // const score =
    //   isNaN(scoreInput) || scoreInput < 1 || scoreInput > 1000
    //     ? 850 // Valor por defecto si el input no es válido
    //     : scoreInput;

    // try {
    //   await dispatch(assignCreditFromScoreThunk(score)).unwrap();
    //   (navigation as any).navigate('CreditConfirmation');
    // } catch (error) {
    //   console.error(
    //     '[CreditValidationScreen] Error al asignar crédito:',
    //     error,
    //   );
    // }
  };

  const logo = (
    <Image
      source={require('../../images/creditivo-logo-full.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  );

  const content = (
    <>
      <Text style={styles.title}>¡Estamos validando tu{'\n'}información!</Text>

      <Text style={styles.subtitle}>
        Danos unos minutos, estamos corriendo para diseñar la línea de compra
      </Text>

      <Text style={styles.subtitleBold}>
        ideal{'\u00A0'}para{'\u00A0'}ti ✨
      </Text>

      <View style={styles.illustrationContainer}>
        <Image
          source={require('../../images/credit-prepare/ivitoo-prepare.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Debug Input - Testing Score Manual */}
      {/* <View style={styles.debugContainer}>
        <Text style={styles.debugLabel}>DEBUG ONLY - Testing Score Manual</Text>
        <Input
          value={debugScore}
          onChangeText={(text: string) => {
            // Solo permitir números
            const numericValue = text.replace(/[^0-9]/g, '');
            if (
              numericValue === '' ||
              (parseInt(numericValue, 10) >= 1 &&
                parseInt(numericValue, 10) <= 1000)
            ) {
              setDebugScore(numericValue);
            }
          }}
          placeholder="850"
          keyboardType="numeric"
          maxLength={4}
          style={styles.debugInput}
        />
        <Text style={styles.debugHint}>Rango: 1 - 1000</Text>
      </View> */}
    </>
  );

  const bottomAction = (
    <Button
      onPress={handleContinue}
      title={isAssigning ? 'Asignando crédito...' : 'Continuar'}
      disabled={isAssigning}
    />
  );

  return (
    <>
      <RegisterLayout
        contentPaddingTop={SCREEN_HEIGHT * 0.04}
        logo={logo}
        bottomAction={bottomAction}>
        {content}
      </RegisterLayout>
    </>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.72 * 0.154,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.068,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
    width: SCREEN_WIDTH * 0.88,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.044,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: '#6E717C',
    textAlign: 'center',
    lineHeight: SCREEN_HEIGHT * 0.025,
    marginBottom: SCREEN_HEIGHT * 0.02,
    width: SCREEN_WIDTH * 0.8,
  },
  subtitleBold: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: '#6E717C',
    textAlign: 'center',
    marginTop: SCREEN_HEIGHT * 0.002,
    marginBottom: SCREEN_HEIGHT * 0.02,
    width: SCREEN_WIDTH * 0.8,
  },
  illustrationContainer: {
    width: SCREEN_WIDTH * 0.52,
    height: SCREEN_WIDTH * 0.52 * 1.2,
    maxHeight: SCREEN_HEIGHT * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 1,
    marginTop: SCREEN_HEIGHT * 0.07,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  debugContainer: {
    width: SCREEN_WIDTH * 0.8,
    marginTop: SCREEN_HEIGHT * 0.04,
    padding: SCREEN_WIDTH * 0.04,
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    borderStyle: 'dashed',
  },
  debugLabel: {
    fontSize: SCREEN_WIDTH * 0.032,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: '#FF8C00',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  debugInput: {
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  debugHint: {
    fontSize: SCREEN_WIDTH * 0.03,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#6E717C',
    textAlign: 'center',
  },
});

export default CreditValidationScreen;
