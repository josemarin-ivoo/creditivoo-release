import { COLORS, FONTS } from 'app/styles/global.style';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon, { IconType } from 'react-native-dynamic-vector-icons';

interface HeaderComponentProps {
  name: string;
}

const HomeHeaderComponent = ({ name }: HeaderComponentProps) => {
  return (
    <View style={styles.headerContainer}>
      {/* Greeting with Name */}
      <Text style={styles.greetingText}>
        <Text style={styles.helloText}>Hola, </Text>
        <Text style={styles.nameText}>{name}</Text>
      </Text>
      {/* Bell Icon */}
      <Icon
        name="bells"
        type={IconType.AntDesign} // Adjust the icon type as needed
        size={24}
        color={COLORS.greyDark} // Match the icon color with the name text
        style={styles.icon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    padding: 16,
  },
  greetingText: {
    fontSize: 18,
    fontFamily: FONTS.poppinsRegular,
  },
  helloText: {
    color: COLORS.primaryBlue, // Blue color for "Hello"
    fontWeight: '600',
  },
  nameText: {
    color: COLORS.greyDark, // Black color for the name
    fontWeight: '700', // Bold for the name
  },
  icon: {
    marginLeft: 8, // Add some spacing between the text and icon if needed
  },
});

export default HomeHeaderComponent;
