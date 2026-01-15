import React, {useMemo} from 'react';
import {Modal, TouchableWithoutFeedback, View} from 'react-native';
// import DateTimePicker from "react-native-ui-datepicker";
import {useTheme} from '@react-navigation/native';
import createStyles from './DatePickerModal.style';

interface DatePickerModalProps {
  isDatePickerVisible: boolean;
  handleCloseModal: () => void;
  date: any; // Puedes ajustar el tipo de `date` según lo que estés usando (por ejemplo, Date, string, etc.)
  handleDateChange: (newDate: any) => void; // Ajusta el tipo de `newDate` si es necesario
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isDatePickerVisible,
  handleCloseModal,
  date,
  handleDateChange,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
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
  );
};

export default DatePickerModal;
