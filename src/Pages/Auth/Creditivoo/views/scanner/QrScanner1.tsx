import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, Dimensions, TouchableOpacity, Modal, Alert, ScrollView, ActivityIndicator, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview'; // Asegúrate de instalarlo
import { IVOO_COLORS, IVOO_TYPOGRAPHY } from '../../styles';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import Button from '../../components/Button';
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const base64Encode = (str: string): string => {
    return typeof btoa === 'function' ? btoa(str) : 'ERROR_BTOA_UNDEFINED';
};

const QrScanner: React.FC = () => {

 const [amount, setAmount] = useState<string>('10.50');
   const [reference, setReference] = useState<string>('000123');
   const [nombre, setNombre] = useState<string>('TITULAR PRUEBA');
   const [tipo, setTipo] = useState<string>('V');
   const [tipo_transaccion] = useState<string>('CREDITO');
   const [identificacion, setIdentificacion] = useState<string>('19999907');
   const [statusMessage, setStatusMessage] = useState<string>('Esperando datos para pre-registro...');
   const [isLoading, setIsLoading] = useState<boolean>(false);
 
   // 🟢 NUEVO ESTADO: Almacena la URL de pago. Si tiene valor, muestra el WebView.
   const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
 
   // --- Constantes de Integración ---
   const BASE_URL: string = "https://paytest.megasoft.com.ve/action/paymentgatewayuniversal-prereg";
   const COD_AFILIACION: string = "20250811";
   
   const user: string = "ivoouniv";
   const pass: string = "Caracas123.1"; 
 
   // ------------------------------------------------------------------
   // 🟢 FUNCIÓN PARA EL PRE-REGISTRO
   // ------------------------------------------------------------------
   const handleMegasoftPaymentTest = async () => {
     
     if (!amount || parseFloat(amount) <= 0 || !reference || !identificacion) {
       setStatusMessage('Error: Completa todos los campos obligatorios.');
       return;
     }
 
     setIsLoading(true);
     setStatusMessage('Procesando pre-registro con MegaSoft...');
     
     try {
         const stringAuth: string = base64Encode(`${user}:${pass}`); 
 
         const xmlBody: string = `
           <request>
               <cod_afiliacion>${COD_AFILIACION}</cod_afiliacion>
               <factura>${reference}</factura> 
               <monto>${parseFloat(amount).toFixed(2)}</monto>
               <nombre>${nombre}</nombre>
               <tipo>${tipo}</tipo>
               <cedula_rif>${identificacion}</cedula_rif>
           </request>
                   `.trim();
 
         const response: Response = await fetch(BASE_URL, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/xml',
                 'Authorization': `Basic ${stringAuth}`,
             },
             body: xmlBody,
         });
 
         const responseData: string = await response.text(); 
         
         if (response.ok && responseData.trim().match(/^\d+$/)) { 
             const referenciaObtenida: string = responseData.trim();

             console.log(referenciaObtenida);
             
             // 6. Construcción de URL de Pago y 🟢 CAMBIO DE ESTADO
             const url: string = `https://paytest.megasoft.com.ve/action/paymentgatewayuniversal-data?control=${referenciaObtenida}&tipo=${tipo}`;
             
             // 🟢 GUARDAR LA URL para renderizar el WebView
             setPaymentUrl(url); 
             setStatusMessage(`✅ Referencia obtenida: ${referenciaObtenida}. Cargando formulario...`);
 
         } else {
             const status: number = response.status;
             setStatusMessage(`❌ Error ${status}. Revise la consola.`);
             Alert.alert(`Fallo API ${status}`, responseData.substring(0, 100));
         }
 
     } catch (error) {
         const errorMessage = error instanceof Error ? error.message : "Error desconocido";
         setStatusMessage('❌ Fallo de conexión o red. ¿Problema de SSL/TLS?');
         Alert.alert("Error de Conexión", errorMessage);
     } finally {
         setIsLoading(false);
     }
   };



  const handleScanQR = () => {
    // TODO: Implementar escaneo de QR
    console.log('Scan QR code');
  };

  if (paymentUrl) {
     return (
       <SafeAreaView style={styles.webViewContainer}>
         {/* Botón para volver al formulario */}
         <TouchableOpacity style={styles.closeButton} onPress={() => setPaymentUrl(null)}>
             <Text style={styles.closeButtonText}>✖️ Cerrar Pago</Text>
         </TouchableOpacity>
 
         <WebView
           source={{ uri: paymentUrl }}
           style={styles.webview}
           javaScriptEnabled={true}
           domStorageEnabled={true}
           startInLoadingState={true}
           renderLoading={() => (
             <ActivityIndicator style={styles.loading} size="large" color="#10B981" />
           )}
         />
       </SafeAreaView>
     );
   }
 
   // ------------------------------------------------------------------
   // 🟢 RENDERIZADO DEL FORMULARIO
   // ------------------------------------------------------------------
   return (
     <ScrollView contentContainerStyle={styles.scrollContainer}>
       <View style={styles.formContainer}>
         <Text style={styles.headerText}>
           Formulario de Pruebas MegaSoft (RN)
         </Text>
         
         {/* Campos de Prueba */}
         <TextInput style={styles.input} placeholder="Monto (ej: 10.50)" placeholderTextColor="#999" keyboardType="numeric" value={amount} onChangeText={setAmount} editable={!isLoading} />
         <TextInput style={styles.input} placeholder="Factura (ej: 000123)" placeholderTextColor="#999" keyboardType="default" value={reference} onChangeText={setReference} editable={!isLoading} />
         <TextInput style={styles.input} placeholder="Nombre del Cliente" placeholderTextColor="#999" value={nombre} onChangeText={setNombre} editable={!isLoading} />
         <TextInput style={styles.input} placeholder="Tipo (V/J/G)" placeholderTextColor="#999" value={tipo} onChangeText={setTipo} editable={!isLoading} />
         <TextInput style={styles.input} placeholder="Identificación/Cédula" placeholderTextColor="#999" value={identificacion} onChangeText={setIdentificacion} editable={!isLoading} />
 
         {/* Botón de Pago */}
         <TouchableOpacity
           style={styles.button}
           onPress={handleMegasoftPaymentTest}
           disabled={isLoading}
         >
           {isLoading ? (
             <ActivityIndicator color="#FFFFFF" />
           ) : (
             <Text style={styles.buttonText}>
               Ejecutar Pre-Registro y Pagar
             </Text>
           )}
         </TouchableOpacity>
 
         {/* Mensaje de Estado */}
         <Text style={styles.statusMessage}>{statusMessage}</Text>
       </View>
     </ScrollView>
   );
 }

const styles = StyleSheet.create({
  // 🟢 Estilos para el WebView
  webViewContainer: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  webview: {
    flex: 1,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 10,
  },
  // 🟢 Estilos para el Formulario
  scrollContainer: {
    flexGrow: 1, 
    justifyContent: 'center',
    backgroundColor: '#F7F9FC',
  },
  formContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    fontSize: 16,
    color: '#374151',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#10B981',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusMessage: {
    marginTop: 30,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
    color: '#4B5563',
  }
});

export default QrScanner;
