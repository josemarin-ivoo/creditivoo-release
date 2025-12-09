import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  Text,
  Image,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Button} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const TermScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Verificar si viene del ProfileScreen
  const fromProfile = (route.params as any)?.fromProfile || false;

  const handleSignContract = () => {
    if (fromProfile) {
      // Si viene del ProfileScreen, volver atrás
      navigation.goBack();
    } else {
      // Navegar a la pantalla de datos personales
      (navigation as any).navigate('PersonalInfoForm');
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const isAtBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 10; // 10px de margen de error

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    } else if (!isAtBottom && hasScrolledToBottom) {
      setHasScrolledToBottom(false);
    }
  };

  const logo = (
    <Image
      source={require('../../images/creditivo-logo-full.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  );

  const content = (
    <>
      <Text style={styles.title}>
        Términos y Condiciones{'\n'}contrato con Creditivoo
      </Text>

      <ScrollView
        ref={scrollViewRef}
        style={styles.termsContainer}
        contentContainerStyle={styles.termsContent}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        <Text style={styles.termsText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.{'\n\n'}Sed ut
          perspiciatis unde omnis iste natus error sit voluptatem accusantium
          doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo
          inventore veritatis et quasi architecto beatae vitae dicta sunt
          explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
          odit aut fugit, sed quia consequuntur magni dolores eos qui ratione
          voluptatem sequi nesciunt.{'\n\n'}Neque porro quisquam est, qui
          dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed
          quia non numquam eius modi tempora incidunt ut labore et dolore magnam
          aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
          exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex
          ea commodi consequatur?{'\n\n'}Quis autem vel eum iure reprehenderit
          qui in ea voluptate velit esse quam nihil molestiae consequatur, vel
          illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos
          et accusamus et iusto odio dignissimos ducimus qui blanditiis
          praesentium voluptatum deleniti atque corrupti quos dolores et quas
          molestias excepturi sint occaecati cupiditate non provident.{'\n\n'}
          Similique sunt in culpa qui officia deserunt mollitia animi, id est
          laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita
          distinctio. Nam libero tempore, cum soluta nobis est eligendi optio
          cumque nihil impedit quo minus id quod maxime placeat facere possimus,
          omnis voluptas assumenda est, omnis dolor repellendus.
        </Text>
      </ScrollView>
    </>
  );

  const bottomAction = (
    <Button
      onPress={handleSignContract}
      title={fromProfile ? 'Listo' : 'Firmar contrato'}
      disabled={fromProfile ? false : !hasScrolledToBottom}
      style={{
        opacity: fromProfile ? 1 : hasScrolledToBottom ? 1 : 0.4,
      }}
    />
  );

  return (
    <>
      <RegisterLayout
        contentPaddingTop={SCREEN_HEIGHT * 0.04}
        logo={logo}
        bottomAction={bottomAction}>
        {content}
      </RegisterLayout>
    </>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.72 * 0.154,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.064,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
    width: SCREEN_WIDTH * 0.88,
  },
  termsContainer: {
    width: SCREEN_WIDTH * 0.78,
    maxHeight: SCREEN_HEIGHT * 0.9,
    flex: 1,
    alignSelf: 'center',
  },
  termsContent: {
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    paddingBottom: SCREEN_HEIGHT * 0.04,
  },
  termsText: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: '#6E717C',
    lineHeight: SCREEN_HEIGHT * 0.025,
    textAlign: 'left',
  },
});

export default TermScreen;
