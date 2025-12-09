import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface HelpTopic {
  id: string;
  title: string;
}

const HelpScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleTopicPress = (topicId: string) => {
    // TODO: navegación a detalle del tema
    console.log('Topic pressed:', topicId);
  };

  const topics: HelpTopic[] = [
    {id: 'credits', title: 'Créditos'},
    {id: 'app', title: 'Sobre la aplicación'},
    {id: 'general', title: 'Información general'},
    {id: 'security', title: 'Seguridad y acceso'},
  ];

  return (
    <CurvedHeaderLayout
      title="Ayuda"
      showBackButton={true}
      onBackPress={handleBackPress}
      scroll={true}>
      <View style={styles.content}>
        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>¿Cómo podemos ayudarte?</Text>
          <Text style={styles.emoji}>😎</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="¿Cuál es tu duda?"
            placeholderTextColor={IVOO_COLORS.grayMedium}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Icon
            name="search"
            type={IconType.Feather}
            size={20}
            color="#FF6B9D"
            style={styles.searchIcon}
          />
        </View>

        {/* Common Questions Section */}
        <View style={styles.topicsSection}>
          <Text style={styles.topicsTitle}>Las dudas más comunes sobre</Text>

          <View style={styles.topicsList}>
            {topics.map(topic => (
              <TouchableOpacity
                key={topic.id}
                style={[styles.topicItem]}
                onPress={() => handleTopicPress(topic.id)}>
                <View style={styles.topicLeft}>
                  <Text style={styles.topicText}>{topic.title}</Text>
                </View>
                <Icon
                  name="chevron-forward"
                  type={IconType.Ionicons}
                  size={20}
                  color={IVOO_COLORS.grayLight}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: SCREEN_HEIGHT * 0.02,
    paddingBottom: SCREEN_HEIGHT * 0.03,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  greetingText: {
    fontSize: SCREEN_WIDTH * 0.041,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  emoji: {
    fontSize: SCREEN_WIDTH * 0.05,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    width: SCREEN_WIDTH * 0.82,
    alignSelf: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.045,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    marginBottom: SCREEN_HEIGHT * 0.04,
    shadowColor: '#000',
  },
  searchInput: {
    flex: 1,
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textPrimary,
    padding: 0,
    lineHeight: SCREEN_HEIGHT * 0.05,
  },
  searchIcon: {
    marginLeft: SCREEN_WIDTH * 0.02,
  },
  topicsSection: {
    marginTop: SCREEN_HEIGHT * 0.02,
    width: SCREEN_WIDTH * 0.8,
    alignSelf: 'center',
  },
  topicsTitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  topicsList: {
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    justifyContent: 'space-between',
  },
  topicItemLast: {
    borderBottomWidth: 0,
  },
  topicLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  topicText: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textPrimary,
    flexShrink: 1,
  },
});

export default HelpScreen;
