//import liraries
import React, {Component, useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ActivityIndicator, Button} from 'react-native-paper';
import {MyContext} from '../../App';

// create a component
const JersAppButton = ({name, onPress, mode, isProcessing, width}) => {
  const {jersAppTheme} = useContext(MyContext);
  const styles = StyleSheet.create({
    button: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: jersAppTheme.themeText,
      width: width,
    },
  });
  return (
    <Button
      onPress={onPress}
      mode={mode ? mode : 'contained'}
      style={styles.button}
      textColor={jersAppTheme.main}>
      {isProcessing ? (
        <ActivityIndicator animating={true} color={jersAppTheme.appBar} />
      ) : (
        name
      )}
    </Button>
  );
};

//make this component available to the app
export default JersAppButton;
