import React, {useContext} from 'react';
import {StyleSheet, View} from 'react-native';
import {MyContext} from '../App';
import {Button} from 'react-native-paper';
export default function Themes(props) {
  const {jersAppTheme, setthemeHandler} = useContext(MyContext);

  const styles = StyleSheet.create({
    content: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: 10,
      gap: 50,
      flex: 1,
      backgroundColor: jersAppTheme.main,
    },
  });
  const handleChangeTheme = theme => {
    setthemeHandler(theme);
    props.navigation.navigate('Home');
  };
  return (
    <View style={styles.content}>
      {[
        {
          name: 'JersApp',
          onclick: () => {
            handleChangeTheme('JersApp');
          },
        },

        {
          name: 'WhatsApp',
          onclick: () => {
            handleChangeTheme('Whatsapp');
          },
        },
        {
          name: 'Dark Mode',
          onclick: () => {
            handleChangeTheme('DarkMode');
          },
        },
      ].map((btn, index) => (
        <Button mode="outlined" key={index} onPress={btn.onclick}>
          {btn.name}
        </Button>
      ))}
    </View>
  );
}
