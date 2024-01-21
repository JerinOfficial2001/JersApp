import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {requestContactsPermission} from '../src/controllers/contacts';
import {Searchbar, TextInput} from 'react-native-paper';

export default function Message({route, navigation, ...props}) {
  const {id} = route.params;

  useEffect(() => {
    requestContactsPermission().then(res => {
      if (res) {
        const particularData = res.find(i => i.rawContactId == id);
        navigation.setOptions({
          title: particularData ? particularData.displayName : 'Message',
        });
      }
    });
  }, []);
  return (
    <ImageBackground
      source={require('../src/assets/chatBg.png')} // specify the path to your image
      style={styles.backgroundImage}>
      {/* Your screen content goes here */}
      <FlatList
        style={styles.content}
        data={[1, 2, 3, 4, 5, 6]}
        renderItem={({item}) => (
          <View style={styles.messageCardContainer}>
            <Text style={styles.messageCardtext}>{item}</Text>
          </View>
        )}
      />

      <View style={{padding: 10}}>
        <Searchbar
          placeholder="Message"
          style={styles.inputField}
          placeholderTextColor="#697279"
          cursorColor="#008169"
          icon={() => {
            return (
              <TouchableOpacity>
                <Image
                  source={require('../src/assets/emoji/happy.png')}
                  style={{height: 20, width: 20}}
                />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1, // Make sure the image takes the entire screen
    resizeMode: 'cover', // Resize the image to cover the entire container
    justifyContent: 'center', // Center the content inside the container
  },
  content: {
    flexDirection: 'column-reverse',
    padding: 10,
    gap: 2,
  },
  inputField: {
    backgroundColor: '#2d383e',
  },
  messageCardContainer: {
    marginVertical: 3,
    width: 'auto',
  },
  messageCardtext: {
    backgroundColor: '#064e49',
    width: 'auto',
  },
});
