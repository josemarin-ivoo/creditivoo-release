import React, { useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "store/store";
import { fetchPaymentsByPurchaseId } from "store/slices/payment-slice";
import PaymentItemLayout from "./payment-item-layout/PaymentItemLayout";
import LoaderSpinner from "@shared-components/loader-spinner/LoaderSpinner";

const PaymentItem: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedPurchaseId } = useSelector(
    (state: RootState) => state.purchases
  );
  const { payments, isLoading } = useSelector(
    (state: RootState) => state.payments
  );

  useEffect(() => {
    if (selectedPurchaseId !== null) {
      dispatch(fetchPaymentsByPurchaseId(selectedPurchaseId));
    }
  }, [selectedPurchaseId, dispatch]);

  if (isLoading || !(payments.length > 0))
    return (
      <View style={styles.loader}>
        <LoaderSpinner size={32} />
      </View>
    );

  return (
    <FlatList
      data={payments}
      style={styles.listContainer}
      renderItem={({ item }) => <PaymentItemLayout payment={item} />}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: { marginTop: 16 },
  loader: {
    marginVertical: 24,
  },
});

export default PaymentItem;
