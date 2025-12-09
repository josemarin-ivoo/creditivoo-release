import Button from '@shared-components/button/Button';
import Input from '@shared-components/input/Input';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
// eslint-disable-next-line import/no-extraneous-dependencies
import dayjs from 'dayjs';
import React, {useMemo, useState} from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useNavigation, useTheme} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import createStyles from './CustomerDobScreen.style';
import {SCREENS} from '@shared-constants';
import {useDispatch} from 'react-redux';
import {updateUser} from 'store/slices/users-slice';

const CustomerDobScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [date, setDate] = useState(dayjs());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const handlePressLogin = () => {
    dispatch(updateUser({dob: date.toISOString()}));
    navigation.navigate(SCREENS.SELLER.CUSTOMER_DOCUMENT as never);
  };

  const handleDateChange = (newDate: any) => {
    setDate(newDate.date);
    setIsDatePickerVisible(false);
  };

  const handleInputPress = () => {
    setIsDatePickerVisible(true);
  };

  const handleCloseModal = () => {
    setIsDatePickerVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.title}>
          <Text style={{fontSize: 32}}>📅</Text>
          <TextWrapper semiBoldSora fontSize={21}>
            Fecha de Nacimiento
          </TextWrapper>
        </View>
        <View style={styles.input}>
          <TouchableOpacity onPress={handleInputPress}>
            <Input
              value={date.format('DD/MM/YYYY')}
              placeholder="Fecha"
              keyboardType="default"
              editable={false}
            />
          </TouchableOpacity>
        </View>

        <Modal
          visible={isDatePickerVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseModal}>
          <TouchableWithoutFeedback onPress={handleCloseModal}>
            <View style={styles.modalBackground}>
              <TouchableWithoutFeedback>
                <View style={styles.datePickerContainer}>
                  {/* <DateTimePicker
                    mode="single"
                    date={date}
                    onChange={handleDateChange}
                    displayFullDays
                    calendarTextStyle={styles.calendarTextStyle}
                    headerTextContainerStyle={styles.headerTextContainerStyle}
                    headerTextStyle={styles.headerTextStyle}
                    headerButtonStyle={styles.headerButtonStyle}
                    headerButtonSize={20}
                    monthContainerStyle={styles.monthContainerStyle}
                    weekDaysTextStyle={styles.weekDaysTextStyle}
                    dayContainerStyle={styles.dayContainerStyle}
                  /> */}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
      <View style={styles.button}>
        <Button title="Continuar" onPress={handlePressLogin} />
      </View>
    </SafeAreaView>
  );
};

export default CustomerDobScreen;
