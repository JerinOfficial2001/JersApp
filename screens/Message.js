import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  addContact,
  getContactByUserId,
  requestContactsPermission,
} from '../src/controllers/contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getMessage, sendMessage} from '../src/controllers/chats';
import {io} from 'socket.io-client';
import {iprotecsLapIP} from '../src/api';
import {Bubble, GiftedChat, Send} from 'react-native-gifted-chat';

export default function Message({route, navigation, ...props}) {
  const {id} = route.params;
  const [messages, setMessages] = useState([]);
  const [userDetails, setuserDetails] = useState({});
  const [contactDetails, setcontactDetails] = useState({});
  useEffect(() => {
    AsyncStorage.getItem('userData').then(data => {
      const userData = JSON.parse(data);
      if (userData) {
        setuserDetails(userData);
        getContactByUserId(userData?._id).then(contacts => {
          if (contacts) {
            const particularContact = contacts.find(
              i => i.ContactDetails.rawContactId == id,
            );
            if (particularContact) {
              console.log(particularContact);

              setcontactDetails(particularContact);
              navigation.setOptions({
                title: particularContact
                  ? particularContact.ContactDetails.displayName
                  : 'Message',
              });

              setformData({
                ...formData,
                recipient: particularContact?._id,
                username: userData?._id,
                user: userData,
              });
              getMessage().then(data => {
                const filterID = [formData?.recipient, formData?.username];

                const particularChats = data.filter(i =>
                  filterID.every(id => i.recipient == id || i.username == id),
                );
                console.log(filterID);
                setMessages(particularChats);
              });
            }
          }
        });
      }
    });
  }, []);

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
    if (userDetails && contactDetails) {
      addContact(
        contactDetails,
        userDetails._id,
        userDetails.name,
        contactDetails.rawContactId,
      );
    }
    const socket = io(iprotecsLapIP);

    // Send private message
    socket.emit('privateMessage', {
      ...newMessages[0],
      from: formData?.username,
      to: formData?.recipient,
    });
    handleSubmit();
  };
  const handleSubmit = () => {
    sendMessage(formData);
  };
  const renderBubble = props => (
    <Bubble
      {...props}
      textStyle={{
        right: {
          color: 'white', // Text color for messages sent by the current user
        },
        left: {
          color: 'black', // Text color for messages sent by other users
        },
      }}
    />
  );
  const textInputProps = {
    style: styles.inputField,
  };

  const renderSend = props => (
    <Send {...props}>
      <TouchableOpacity>
        <View style={styles.sendBtn}>
          <Image
            source={require('../src/assets/send.png')}
            style={{height: 30, width: 30}}
          />
        </View>
      </TouchableOpacity>
    </Send>
  );
  return (
    <ImageBackground
      source={require('../src/assets/chatBg.png')} // specify the path to your image
      style={styles.backgroundImage}>
      <GiftedChat
        // renderSend={renderSend}
        textInputProps={textInputProps}
        renderBubble={renderBubble}
        messages={messages}
        onSend={onSend}
        user={{_id: formData?.username, name: formData?.username}}
        placeholder="Message"
        onInputTextChanged={val => {
          setformData({...formData, text: val});
        }}
      />
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
    color: 'white',
    borderRadius: 30,
    flex: 1,
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
