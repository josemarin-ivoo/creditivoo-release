import React, { useMemo, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import { WebView } from "react-native-webview";

export default function CasheaTestWebCheckout() {
  const webRef = useRef<WebView>(null);

  const [cedula, setCedula] = useState("22011090");
  const [cartId, setCartId] = useState("TEST-123");
  const [open, setOpen] = useState(false);

  // ✅ URL que abre tu checkout.html (tu web)
  const checkoutUrl = useMemo(() => {
    const base = "https://cashea.creditivoo.com/checkout.html"; // <-- tu archivo real
    const qs = `?cedula=${encodeURIComponent(cedula)}&cartId=${encodeURIComponent(cartId)}`;
    return base + qs;
  }, [cedula, cartId]);

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "CASHEA_RESULT") {
        // ✅ Esto significa: Cashea redirigió al return y ya tenemos idNumber
        Alert.alert("Cashea Return ✅", `idNumber: ${data.idNumber}`);
        console.log("CASHEA_RESULT:", data);
      }

      if (data.type === "CASHEA_GET_ORDER") {
        console.log("CASHEA_GET_ORDER:", data);
      }
    } catch (e) {
      console.log("Mensaje no JSON:", event.nativeEvent.data);
    }
  };

  // (Opcional) para detectar navegación
  const onNavChange = (navState: any) => {
    // Si quieres ver por dónde anda:
    // console.log("NAV:", navState.url);

    // Si ves que llegó al return, puedes hacer cosas extra aquí.
    if (navState.url.includes("/return/")) {
      console.log("Llegó al return:", navState.url);
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: 40 }}>
      {!open ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>Test Cashea Web Checkout</Text>

          <Text>Cédula</Text>
          <TextInput
            value={cedula}
            onChangeText={setCedula}
            keyboardType="number-pad"
            style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}
          />

          <Text>cartId</Text>
          <TextInput
            value={cartId}
            onChangeText={setCartId}
            style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}
          />

          <TouchableOpacity
            onPress={() => {
              if (!/^\d+$/.test(cedula)) return Alert.alert("Error", "Cédula inválida");
              setOpen(true);
            }}
            style={{ backgroundColor: "#111", padding: 12, borderRadius: 10 }}
          >
            <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>
              Abrir Cashea Checkout
            </Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 12, opacity: 0.7 }}>URL:</Text>
          <Text style={{ fontSize: 12 }} selectable>{checkoutUrl}</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ padding: 10, flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "700" }}>Web Checkout</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={{ color: "red", fontWeight: "700" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          <WebView
            ref={webRef}
            source={{ uri: checkoutUrl }}
            onMessage={onMessage}
            onNavigationStateChange={onNavChange}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={["*"]}
            mixedContentMode="always"
            // Para algunos flujos de login:
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
          />
        </View>
      )}
    </View>
  );
}