import React, {useContext, useEffect, useState} from 'react';
import {Pressable, ScrollView, Text, ToastAndroid, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deleteContactById,
  getContactByUserId,
} from '../src/controllers/contacts';
import {useFocusEffect} from '@react-navigation/native';
import {createChat} from '../src/controllers/chats';
import DeleteModal from '../src/components/DeleteModel';
import {TopBarContext} from '../navigations/tabNavigation';
import {RNCamera} from 'react-native-camera';
import {request, PERMISSIONS} from 'react-native-permissions';

export default function Chats(props) {
  const [chats, setChats] = useState([]);
  const [isMsgLongPressed, setisMsgLongPressed] = useState([]);
  const [receiversId, setreceiversId] = useState('');
  const [userDatas, setuserDatas] = useState({});
  const {setisDelete, isModelOpen, setisModelOpen, setopenMenu} =
    useContext(TopBarContext);
  const getDate = timestamps => {
    const date = new Date(timestamps);
    const properDate =
      date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const properMonth =
      date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
    const formatedDate = `${properDate}/${properMonth}/${
      date.getFullYear() % 100
    }`;
    return formatedDate;
  };
  const fetchData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const userData = JSON.parse(data);
        setuserDatas(userData);
        const contacts = await getContactByUserId(userData?._id);
        if (contacts) {
          setChats(
            contacts.map(item => ({...item, date: getDate(item.createdAt)})),
          );
          setisMsgLongPressed(contacts.map(item => ({isSelected: false})));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const addChat = data => {
    if (data.sender && data.receiver) {
      createChat(data).then(res => {
        props.navigation.navigate('Message', {
          // id: data.elem?.ContactDetails.rawContactId,
          id: data.elem.ContactDetails?._id,
        });
      });
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );
  const handleDeleteContact = () => {
    if (receiversId) {
      deleteContactById(userDatas._id, receiversId).then(data => {
        if (data.status == 'ok' && data.message !== 'failed') {
          fetchData();
          handlePress();
          setisModelOpen(false);
          ToastAndroid.show('Deleted', ToastAndroid.SHORT);
        } else {
          ToastAndroid.show('Failed', ToastAndroid.SHORT);
          setisModelOpen(false);
        }
      });
    }
  };

  const handleLongPress = (index, id) => {
    const updatedStates = [...isMsgLongPressed];
    updatedStates[index].isSelected = true;
    setisMsgLongPressed(updatedStates);
    setisDelete(true);
    setreceiversId(id);
  };
  const handlePress = () => {
    const updatedStates = isMsgLongPressed?.map(() => ({isSelected: false}));
    setisMsgLongPressed(updatedStates);
    setisDelete(false);
    setopenMenu(false);
  };
  const handleModelClose = () => {
    setisModelOpen(false);
    handlePress();
  };
  return (
    <Pressable style={{flex: 1}} onPress={handlePress}>
      <ScrollView style={{padding: 10}}>
        {chats?.length > 0 ? (
          chats?.map((elem, index) => {
            const isSelected = isMsgLongPressed[index]?.isSelected;
            return (
              <View
                key={index}
                style={{
                  backgroundColor: isSelected ? 'gray' : 'transparent',
                  borderRadius: 3,
                }}>
                <MyComponent
                  contact={elem}
                  onclick={() => {
                    addChat({
                      sender: userDatas._id,
                      receiver: elem.ContactDetails._id,
                      elem: elem,
                    });
                    handlePress();
                  }}
                  onLongPress={() => {
                    handleLongPress(index, elem.ContactDetails._id);
                  }}
                />
              </View>
            );
          })
        ) : (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              height: 600,
            }}>
            <Text style={{color: 'gray'}}>No Chats</Text>
          </View>
        )}
        <DeleteModal
          handleModelClose={handleModelClose}
          visible={isModelOpen}
          handleDelete={handleDeleteContact}
        />
      </ScrollView>
    </Pressable>
  );
}
