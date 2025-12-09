import React, { useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import createStyles from "./UserRegisteredLayout.style";
import UserIcon from "assets/svgs/profile-screen/UserIcon.svg";
import DocuIcon from "assets/svgs/profile-screen/DocuIcon.svg";
import CalendarIcon from "assets/svgs/profile-screen/CalendarIcon.svg";
import { capitalizeWords, formatDate } from "utils";
import { Separator } from "@shared-components/separator/Separator";
import Button from "@shared-components/button/Button";
import RegisteredInfo from "@shared-components/registered/RegisteredInfo";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "store/store";
import TextWrapper from "@shared-components/text-wrapper/TextWrapper";
import { updateAuth } from "store/slices/auth-slice";
import { clearUser } from "store/slices/users-slice";
import { getUniqueId } from "react-native-device-info";
import { submitUserDevice } from "store/slices/userDevice-slice";
import { User } from "@services/api/auth";
import Brand from "@shared-components/brand/PurchaseItem";
import { SCREENS } from "@shared-constants";
import {
  fetchPurchasesByUserId,
  submitPurchase,
} from "store/slices/purchase-slice";
import { PurchaseResponse, PurchaseStatus } from "@services/api/purchases";

export type RegisteredLayoutType = "user" | "device" | "purchase";

interface Props {
  onClose: () => void;
}

const UserRegisteredLayout: React.FC<Props> = ({ onClose }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user, token }: { user: User; token: string } = useSelector(
    (state: RootState) => state.users
  );
  const { financingSelectedId } = useSelector(
    (state: RootState) => state.financing
  );
  const dispatch = useDispatch<AppDispatch>();
  const { selectedModel } = useSelector((state: RootState) => state.models);
  const [userPurchases, setUserPurchases] = useState<PurchaseResponse[]>([]);
  const navigation = useNavigation();
  const [uniqueAndroId, setUniqueAndroId] = useState<string>("");
  const [registeredLayout, setRegisteredLayout] =
    useState<RegisteredLayoutType>("user");

  const userFields = useMemo(
    () => [
      {
        label: "Fecha de Nacimiento",
        value: user?.dob ? formatDate(user.dob, "DD/MM/YYYY") : "",
        icon: <CalendarIcon />,
      },
      {
        label: "Nombre",
        value: capitalizeWords(`${user?.name} ${user?.lastname}`),
        icon: <UserIcon />,
      },
      {
        label: "Documento",
        value: user?.document || "",
        icon: <DocuIcon />,
      },
    ],
    [user]
  );

  useEffect(() => {
    const fetchUniqueId = async () => {
      const id = await getUniqueId();
      setUniqueAndroId(id);
    };
    fetchUniqueId();
  }, []);

  const onContinue = async () => {
    try {
      //await handleSubmitUserDevice();
      const existingPurchases = await dispatch(
        fetchPurchasesByUserId(user.id)
      ).unwrap();
      await handleExistingPurchases(existingPurchases);
    } catch (error) {
      handleErrors(error);
    }
  };

  const handleSubmitUserDevice = async () => {
    const userDeviceData = {
      userId: user.id,
      deviceId: selectedModel?.id || null,
      uniqueAndroId,
    };
    return dispatch(submitUserDevice(userDeviceData)).unwrap();
  };

  const handleExistingPurchases = async (
    existingPurchases: PurchaseResponse[]
  ) => {
    const pendingPurchase = existingPurchases.find(
      (purchase) => purchase.status === "PENDING"
    );

    if (pendingPurchase) {
      setUserPurchases(existingPurchases);
      setRegisteredLayout("purchase");
    } else {
      await handleSubmitPurchase(user.id);
      successfulProcess();
    }
  };

  const handleSubmitPurchase = async (userId: number) => {
    const purchaseData = {
      userId,
      deviceId: selectedModel?.id || null,
      financingTypeId: financingSelectedId,
      totalAmount: parseFloat(selectedModel?.price || "0"),
      status: "PENDING" as PurchaseStatus,
    };
    return dispatch(submitPurchase(purchaseData)).unwrap();
  };

  const handleErrors = async (error: any) => {
    if (error.message === "User device already registered") {
      setRegisteredLayout("device");
    } else if (error.message === "No purchases found for this user") {
      await handleSubmitPurchase(user.id);
      successfulProcess();
    } else {
      Alert.alert("Error", error.message);
    }
  };

  const resetProcess = () => {
    //dispatch(clearUser());
    navigation.navigate(SCREENS.SELLER.CUSTOMER_DEVICE_SELECT.BRANDS as never);
  };

  const successfulProcess = async () => {
    onClose();
    await dispatch(updateAuth({ token, user }));
    dispatch(clearUser());
  };

  if (!user.email) return <></>;

  return (
    <View style={styles.container}>
      <RegisteredInfo
        email={user?.email || "test@email.com"}
        info={registeredLayout}
      />
      {registeredLayout === "user" && (
        <View style={styles.listContainer}>
          {userFields.map((field, index) => (
            <View key={index} style={styles.fieldContainer}>
              <View style={styles.dataContainer}>
                {field.icon}
                <View style={styles.detailContainer}>
                  <TextWrapper fontSize={12} color={colors.itemSubtitle}>
                    {field.label}
                  </TextWrapper>
                  <TextWrapper fontSize={12} semiBoldSora>
                    {field.value}
                  </TextWrapper>
                </View>
              </View>
              {index < userFields.length - 1 && <Separator />}
            </View>
          ))}
        </View>
      )}
      {registeredLayout !== "user" &&
        userPurchases.map((purchase) => {
          if (purchase.status === "PENDING") {
            return (
              <View key={purchase.id}>
                <Brand
                  phoneBrand={purchase.device?.brand.name || "Brand"}
                  selectedModel={purchase.device?.name || "Model"}
                />
              </View>
            );
          }
          return null;
        })}
      <View style={styles.button}>
        <Button
          onPress={
            registeredLayout === "user"
              ? onContinue
              : registeredLayout === "purchase"
                ? successfulProcess
                : resetProcess
          }
          title={registeredLayout !== "device" ? "Continuar" : "Volver"}
        />
      </View>
    </View>
  );
};

export default UserRegisteredLayout;
