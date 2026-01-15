import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "store/store";
import TextWrapper from "@shared-components/text-wrapper/TextWrapper";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { formatDate } from "utils";
import { Separator } from "@shared-components/separator/Separator";
import { useNavigation, useTheme } from "@react-navigation/native";
import { palette } from "@theme/themes";
import { setSelectedPaymentId } from "store/slices/payment-slice";
import { SCREENS } from "@shared-constants";

const PaymentAlert = () => {
  const { payments, isLoading } = useSelector(
    (state: RootState) => state.payments
  );
  const theme = useTheme();
  const { colors }: { colors: typeof palette } = theme;
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const overdueOrPending = useMemo(
    () =>
      payments.some(
        (payment) =>
          payment.status === "PENDING" || payment.status === "PASS_DUE"
      ),
    [payments]
  );

  const handleGoPay = (paymentId: number) => {
    dispatch(setSelectedPaymentId(paymentId));
    navigation.navigate(SCREENS.PAYMENT_SELECTION as never);
  };

  if (!overdueOrPending || isLoading) return <></>;

  return (
    <View style={styles.container}>
      {payments.map((payment) => {
        const { status } = payment;
        if (status !== "PENDING" && status !== "PASS_DUE") return null;

        return (
          <View
            key={payment.id}
            style={[
              styles.alertContainer,
              { backgroundColor: status === "PENDING" ? "#FEFFC7" : "#F8D7DA" },
            ]}
          >
            <View style={styles.infoContainer}>
              <View style={styles.icon}>
                <Icon
                  type={
                    status === "PENDING"
                      ? IconType.Foundation
                      : IconType.Feather
                  }
                  name={status === "PENDING" ? "alert" : "alert-triangle"}
                  size={46}
                  color={status === "PENDING" ? "#FFB92D" : "#842029"}
                />
              </View>
              <View>
                <View style={styles.titleInfo}>
                  <TextWrapper semiBoldSora fontSize={15}>
                    Pago
                  </TextWrapper>
                  <TextWrapper extraBoldSora fontSize={15}>
                    {" "}
                    {formatDate(payment.paymentDate, "MMM D, YYYY")}
                  </TextWrapper>
                </View>

                {status === "PENDING" ? (
                  <TextWrapper fontSize={8}>
                    Ventana de pago abierta correspondiente al{" "}
                    {formatDate(payment.paymentDate, "D [de] MMMM")}
                  </TextWrapper>
                ) : (
                  <>
                    <TextWrapper fontSize={8}>
                      Su pago correspondiente al{" "}
                      {formatDate(payment.paymentDate, "D [de] MMMM")} se
                      encuentra pendiente.
                    </TextWrapper>
                    <View style={{ flexDirection: "row" }}>
                      <TextWrapper fontSize={8}>
                        El Dispositivo será bloqueado en:
                      </TextWrapper>
                      <TextWrapper fontSize={8} boldSora>
                        {" "}
                        3 días
                      </TextWrapper>
                    </View>
                  </>
                )}
              </View>
            </View>
            {status === "PENDING" && (
              <View style={styles.goPay}>
                <TouchableOpacity onPress={() => handleGoPay(payment.id)}>
                  <TextWrapper semiBoldSora fontSize={9}>
                    Ir a pagar
                  </TextWrapper>
                  <Separator backgroundColor={colors.totalBlack} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  alertContainer: { borderRadius: 8, padding: 12 },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  icon: {
    marginLeft: 12,
  },
  titleInfo: {
    flexDirection: "row",
    position: "relative",
    bottom: 2,
  },
  goPay: {
    alignItems: "flex-end",
  },
});

export default PaymentAlert;
