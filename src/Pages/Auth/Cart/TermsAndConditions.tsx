import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

// import Stripe from 'tipsi-stripe';
import {Icon} from 'react-native-elements';

import analytics from '@react-native-firebase/analytics';
import {useLazyQuery} from '@apollo/client';
import {AppContext} from '../../AppContext';
import CommonHandlers from '../../../Utils/CommonHandlers';
import commonStyle from '../../../../commonStyle';
import {CustomButton} from '../../../Components/CustomButton';
import CustomInput from '../../../Components/CustomInput';
import CustomPBar from '../../../Components/CustomPBar';
import {GetCards, saveCard} from '../../../Queries/queries';
import Helper from '../../../Utils/Helper';
import {AnalyticsAddPaymentInfo} from '../../../helpers/analyticHelper';
import {AddPAYCards} from '../../../redux/PaymentMethodsReducers/PaymentMethodsAction';
import Colors from '../../../Utils/Colors';
import {translate} from '../../../locales';

export const removeNonNumber = (string = '') => string.replace(/[^\d]/g, '');

const TermsAndConditions = props => {
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');

  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);

  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor: appTheme.background,
          borderTopLeftRadius: isDark ? 0 : 24,
          borderTopRightRadius: isDark ? 0 : 24,
        },
      ]}>
      <View style={styles.headerWrap}>
        <View style={styles.ButtonViewStyles}>
          <TouchableHighlight
            onPress={() => {
              Helper.HandleVibration();
              props.CloseBottomsheet();
            }}
            underlayColor={Colors.transparent}
            style={{padding: 5}}>
            <Icon
              name="times"
              type="font-awesome-5"
              size={24}
              color={isDark ? Colors.white : Colors.black}
            />
          </TouchableHighlight>
        </View>
      </View>

      <View style={{paddingHorizontal: 12, flex: 1}}>
        <Text
          style={[
            commonStyle.h2,
            commonStyle.fontBold,
            {
              marginBottom: 18,
              color: isDark ? Colors.disable_clr : Colors.black,
            },
          ]}>
          Temblores y condiciones
        </Text>
        <ScrollView style={{flex: 1}}>
          <View style={[commonStyle.flex_1]}>
            <Text style={{color: isDark ? Colors.disable_clr : Colors.black}}>
              A good example of a paragraph contains a topic sentence, details
              and a conclusion. 'There are many different kinds of animals that
              live in China. Tigers and leopards are animals that live in
              China's forests in the north. In the jungles, monkeys swing in the
              trees and elephants walk through the brush. A good example of a
              paragraph contains a topic sentence, details and a conclusion.
              'There are many different kinds of animals that live in China.
              Tigers and leopards are animals that live in China's forests in
              the north. In the jungles, monkeys swing in the trees and
              elephants walk through the brush. A good example of a paragraph
              contains a topic sentence, details and a conclusion. 'There are
              many different kinds of animals that live in China. Tigers and
              leopards are animals that live in China's forests in the north. In
              the jungles, monkeys swing in the trees and elephants walk through
              the brush.A good example of a paragraph contains a topic sentence,
              details and a conclusion. 'There are many different kinds of
              animals that live in China. Tigers and leopards are animals that
              live in China's forests in the north. In the jungles, monkeys
              swing in the trees and elephants walk through the brush.A good
              example of a paragraph contains a topic sentence, details and a
              conclusion. 'There are many different kinds of animals that live
              in China. Tigers and leopards are animals that live in China's
              forests in the north. In the jungles, monkeys swing in the trees
              and elephants walk through the brush.A good example of a paragraph
              contains a topic sentence, details and a conclusion. 'There are
              many different kinds of animals that live in China. Tigers and
              leopards are animals that live in China's forests in the north. In
              the jungles, monkeys swing in the trees and elephants walk through
              the brush.A good example of a paragraph contains a topic sentence,
              details and a conclusion. 'There are many different kinds of
              animals that live in China. Tigers and leopards are animals that
              live in China's forests in the north. In the jungles, monkeys
              swing in the trees and elephants walk through the brush.
            </Text>
          </View>
        </ScrollView>
        <CustomPBar showProgress={false} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  ButtonViewStyles: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerWrap: {
    flexDirection: 'row',
    paddingTop: 25,
    paddingHorizontal: 24,
  },
});

export default TermsAndConditions;
