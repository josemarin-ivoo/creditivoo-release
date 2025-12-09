import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

export default function PaymentWebView({ route }) {
    
    // Accede a la URL que pasaste desde CreditivooLogin
    const { url } = route.params;
    const navigation = useNavigation();

    // Puedes agregar aquí una función para detectar cuando la transacción termina,
    // mirando la URL que carga el WebView (`onNavigationStateChange`).
    const handleWebViewNavigation = (navState) => {
        const currentUrl = navState.url;
        console.log("WebView cargando:", currentUrl);
        
        // Ejemplo de lógica para volver: si la URL final contiene una palabra clave de éxito
        // if (currentUrl.includes('success_return_url')) {
        //     navigation.goBack(); // O navegar a otra pantalla de éxito
        //     Alert.alert("Transacción Completada", "El pago ha finalizado.");
        // }
    };

    if (!url) {
        return <View style={styles.errorContainer}><Text>Error: No se proporcionó URL de pago.</Text></View>;
    }

    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: url }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                // Maneja la navegación para detectar resultados de MegaSoft
                onNavigationStateChange={handleWebViewNavigation} 
                
                // Indicador de carga
                startInLoadingState={true}
                renderLoading={() => (
                    <ActivityIndicator 
                        style={styles.loading} 
                        size="large" 
                        color="#10B981" 
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    loading: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        // Asegura que el indicador esté centrado y visible sobre la pantalla
        zIndex: 10,
    },
    errorContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    }
});