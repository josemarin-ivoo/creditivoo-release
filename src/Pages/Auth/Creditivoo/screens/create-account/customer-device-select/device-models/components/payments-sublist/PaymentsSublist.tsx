import React, { useMemo } from "react";
import { FlatList, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import TextWrapper from "@shared-components/text-wrapper/TextWrapper";
import { Separator } from "@shared-components/separator/Separator";
import createStyles from "./PaymentsSublist.style";
import { PaymentDetail } from "@services/api/financing";
import { capitalizeFirstLetter, formatDate } from "utils";

interface SubListProps {
  paymentCuts: PaymentDetail[];
}

const PaymentsSublist: React.FC<SubListProps> = ({ paymentCuts }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <FlatList
      data={paymentCuts}
      keyExtractor={(cut) => cut.date}
      renderItem={({ item: cut, index }) => (
        <View style={styles.dropdownItemContainer}>
          <View style={styles.paymentCutItem}>
            <View>
              <TextWrapper fontSize={10} semiBoldSora>
                {index === 0 ? "Inicial" : `Mes ${index}`}
              </TextWrapper>
              <TextWrapper fontSize={10} color={colors.itemSubtitle}>
                {index === 0
                  ? "Ahora"
                  : capitalizeFirstLetter(formatDate(cut.date, "MMMM D"))}
              </TextWrapper>
            </View>
            <TextWrapper fontSize={10}>${cut.amount.toFixed(2)}</TextWrapper>
          </View>
          {index < paymentCuts.length - 1 && <Separator />}
        </View>
      )}
    />
  );
};

export default PaymentsSublist;
