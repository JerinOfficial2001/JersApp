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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getMessage, sendMessage} from '../src/controllers/chats';
import {io} from 'socket.io-client';
import {iprotecsLapIP} from '../src/api';
import {GiftedChat} from 'react-native-gifted-chat';

export default function Message({route, navigation, ...props}) {
  const {id} = route.params;

  useEffect(() => {
    requestContactsPermission().then(res => {
      if (res) {
        const particularData = res.find(i => i.rawContactId == id);
        navigation.setOptions({
          title: particularData ? particularData.displayName : 'Message',
        });
        AsyncStorage.getItem('userData').then(data => {
          const userData = data ? JSON.parse(data) : false;
          setformData({
            ...formData,
            recipient: particularData?.displayName,
            username: userData?._id,
          });
        });
      }
    });
    getMessage();
  }, []);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = io(iprotecsLapIP);

    // Listen for incoming messages
    socket.on('message', message => {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, message),
      );
    });

    // Listen for private messages
    socket.on('privateMessage', message => {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, message),
      );
    });

    // Clean up on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const [formData, setformData] = useState({});
  const onSend = (newMessages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages),
    );
    const socket = io(iprotecsLapIP);

    // Send private message
    socket.emit('privateMessage', {
      ...newMessages[0],
      from: formData?._id,
      to: formData?.recipient,
    });
    handleSubmit();
  };
  const handleSubmit = () => {
    sendMessage(formData);
    // console.log(formData);
  };
  return (
    <ImageBackground
      source={require('../src/assets/chatBg.png')} // specify the path to your image
      style={styles.backgroundImage}>
      {/* Your screen content goes here */}
      {/* <FlatList
        style={styles.content}
        data={[1, 2, 3, 4, 5, 6]}
        renderItem={({item}) => (
          <View style={styles.messageCardContainer}>
            <Text style={styles.messageCardtext}>{item}</Text>
          </View>
        )}
      /> */}
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{_id: formData?._id}}
        placeholder="Message"
      />
      <View
        style={{
          padding: 10,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Searchbar
          value={formData.text}
          onChangeText={event => {
            setformData({
              ...formData,
              text: event,
            });
          }}
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
        <TouchableOpacity onPress={handleSubmit}>
          <View style={styles.sendBtn}>
            <Image
              source={require('../src/assets/send.png')}
              style={{height: 30, width: 30}}
            />
          </View>
        </TouchableOpacity>
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
    width: '87%',
  },
  messageCardContainer: {
    marginVertical: 3,
    width: 'auto',
  },
  messageCardtext: {
    backgroundColor: '#064e49',
    width: 'auto',
  },
  sendBtn: {
    backgroundColor: '#14a95f',
    padding: 10,
    borderRadius: 200,
    marginLeft: 3,
  },
});
