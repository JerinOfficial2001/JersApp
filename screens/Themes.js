import React, {useContext} from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {MyContext} from '../App';
import {Button, Text} from 'react-native-paper';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
export default function Themes(props) {
  const {jersAppTheme, setthemeHandler} = useContext(MyContext);

  const styles = StyleSheet.create({
    content: {
      display: 'flex',
      flexDirection: 'column',
      padding: 10,
      gap: 50,
      flex: 1,
    },

    backgroundImage: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    appBar: {
      height: 50,
      width: '100%',
      borderTopStartRadius: 20,
      borderTopEndRadius: 20,
      backgroundColor: jersAppTheme.appBar,
      justifyContent: 'space-between',
    },
    cardContainer: {
      width: '100%',
      alignItems: 'center',
    },
  });
  const handleChangeTheme = theme => {
    setthemeHandler(theme);
    // props.navigation.navigate('Home');
  };
  return (
    <SurfaceLayout>
      <View style={styles.content}>
        <ImageBackground
          imageStyle={{borderRadius: 20}}
          source={require('../src/assets/chatBg.png')} // specify the path to your image
          style={styles.backgroundImage}>
          <View style={styles.appBar} />
          <View style={styles.cardContainer}>
            {[
              {
                text: 'Hi there',
                time: '12.05PM',
                type: 'receiver',
                textColor: jersAppTheme.bubbleTextColor,
                backgroundColor: jersAppTheme.bubbleSenderBgColor,
                subText: jersAppTheme.bubblesSubTextColor,
              },
              {
                text: 'Hey bruh',
                time: '12:30PM',
                type: 'sender',

                textColor: jersAppTheme.bubbleTextColor,
                backgroundColor: jersAppTheme.bubbleReceiverBgColor,
                subText: jersAppTheme.bubblesSubTextColor,
              },
            ].map((elem, index) => (
              <View
                key={index}
                style={{
                  minHeight: 60,
                  alignItems: elem.type == 'sender' ? 'flex-start' : 'flex-end',
                  justifyContent: 'center',
                  padding: 5,
                  width: '100%',
                }}>
                <View
                  style={{
                    minWidth: 50,
                    backgroundColor: elem.backgroundColor,
                    borderRadius: 15,
                    padding: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTopLeftRadius: elem.type == 'sender' ? 0 : 15,
                    borderTopEndRadius: elem.type == 'sender' ? 15 : 0,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    gap: 8,
                    paddingHorizontal: 10,
                  }}>
                  <Text style={{color: elem.textColor}}>{elem.text}</Text>
                  <View
                    style={{
                      justifyContent: 'flex-end',
                      height: 20,
                    }}>
                    <Text style={{color: elem.subText, fontSize: 10}}>
                      {elem.time}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ImageBackground>

        {[
          {
            name: 'Default',
            onclick: () => {
              handleChangeTheme('JersApp');
            },
            color:
              jersAppTheme.name == 'JersApp'
                ? '#4BA9DD'
                : jersAppTheme.name == 'DarkMode'
                ? jersAppTheme.appBar
                : 'slategray',
          },

          {
            name: 'WhatsApp',
            onclick: () => {
              handleChangeTheme('Whatsapp');
            },
            color:
              jersAppTheme.name == 'Whatsapp'
                ? '#064e49'
                : jersAppTheme.name == 'DarkMode'
                ? jersAppTheme.appBar
                : 'slategray',
          },
          {
            name: 'Dark Mode',
            onclick: () => {
              handleChangeTheme('DarkMode');
            },
            color: 'slategray',
          },
        ].map((btn, index) => (
          <Button
            style={{
              height: 100,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: btn.color,
            }}
            textColor={jersAppTheme == 'JersApp' ? 'black' : 'white'}
            mode="outlined"
            key={index}
            onPress={btn.onclick}>
            {btn.name}
          </Button>
        ))}
      </View>
    </SurfaceLayout>
  );
}
