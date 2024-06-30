import React, {useContext} from 'react';
import {Image, Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import {DarkThemeSchema, JersAppThemeSchema} from '../../utils/theme';
import {MyContext} from '../../App';
// import {MyContext, MyContextType} from '../../App';

interface TopBarProps {
  title: string;
  rightOnPress: () => void;
  isDelete?: boolean;
  lefOnPress?: () => void;
  arrow?: boolean;
  subtitle?: string;
  isTyping?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  rightOnPress,
  isDelete,
  lefOnPress,
  arrow,
  subtitle,
  isTyping,
}) => {
  const {jersAppTheme, setpageName} = useContext<any>(MyContext);

  return (
    <View style={[styles.container, {backgroundColor: jersAppTheme.appBar}]}>
      <View style={styles.leftContainer}>
        {arrow && (
          <TouchableOpacity onPress={lefOnPress}>
            <Image
              source={require('../assets/leftArrow.png')}
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>
              {isTyping ? 'typing...' : 'Online'}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={rightOnPress}>
        {isDelete ? (
          <Image source={require('../assets/delete.png')} style={styles.icon} />
        ) : (
          !arrow && (
            <Image
              source={require('../assets/vertIcon.png')}
              style={styles.icon}
            />
          )
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: '#151B26',
  },
  leftContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  arrowIcon: {
    height: 25,
    width: 25,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    color: 'white',
    letterSpacing: 1,
    fontSize: 10,
  },
  icon: {
    height: 25,
    width: 25,
  },
});

export default TopBar;
