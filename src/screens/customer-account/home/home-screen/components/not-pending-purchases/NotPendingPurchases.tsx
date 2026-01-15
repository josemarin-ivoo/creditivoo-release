import { View, StyleSheet } from "react-native";
import React from "react";
import BigCheckSVG from "assets/svgs/home-screen/BigCheckSVG.svg";
import TextWrapper from "@shared-components/text-wrapper/TextWrapper";
import { useTheme } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import Brand from "@shared-components/brand/PurchaseItem";

const NotPendingPurchases = () => {
  const theme = useTheme();
  const { colors } = theme;
  const { userPurchases } = useSelector((state: RootState) => state.purchases);
  return (
    <View style={styles.container}>
      <View style={styles.upToDateContainer}>
        <BigCheckSVG />
        <TextWrapper boldSora fontSize={20} color={colors.totalBlack}>
          Estás al día!
        </TextWrapper>
      </View>
      <View style={styles.purchasesTitle}>
        <TextWrapper fontSize={18} boldSora color={colors.totalBlack}>
          Mis compras
        </TextWrapper>
      </View>
      <View style={styles.purchases}>
        {userPurchases.map((purchase) => {
          return (
            <Brand
              key={purchase.id}
              phoneBrand={purchase.device?.brand.name || " "}
              selectedModel={purchase.device?.name || " "}
              withDate
              date={purchase.createdAt}
            />
          );
        })}
      </View>
    </View>
  );
};

export default NotPendingPurchases;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  upToDateContainer: {
    marginTop: 22,
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
  },
  purchasesTitle: {
    marginTop: 16,
    marginLeft: 8,
  },
  purchases: {
    marginTop: 16,
  },
});
