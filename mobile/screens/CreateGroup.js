import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ToastAndroid,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import {MyContext} from '../App';
import ProfilePicModel from '../src/components/ProfilePicModel';
import {
  ActivityIndicator,
  Avatar,
  Button,
  IconButton,
  TextInput,
} from 'react-native-paper';
import DocumentPicker from 'react-native-document-picker';
import {CreateNewGroup} from '../src/controllers/group';
import {QueryClient, useMutation} from '@tanstack/react-query';

export default function CreateGroup({navigation, route, ...props}) {
  const {Data, jersAppTheme, selectedIds, setSelectedIds} =
    useContext(MyContext);
  const {image} = route?.params;

  const toggleSelection = contactId => {
    if (selectedIds.includes(contactId)) {
      setSelectedIds(selectedIds.filter(id => id !== contactId)); // Deselect
      if (selectedIds.length == 1) {
        navigation.navigate('AddParticipants');
      }
    } else {
      setSelectedIds([...selectedIds, contactId]); // Select
    }
  };

  const [isProcessing, setisProcessing] = useState(false);
  const [openImageModel, setopenImageModel] = useState(false);
  const [formData, setformData] = useState({
    group_name: '',
    image: image ? image : null,
    public_id: null,
    isDeleteImg: false,
  });
  const [err, seterr] = useState(false);
  const [errMsg, seterrMsg] = useState('');
  const queryClient = new QueryClient();
  const handleFormData = (key, value) => {
    setformData(prev => ({...prev, [key]: value}));
  };
  const handlePick = async () => {
    const result = await DocumentPicker.pick({
      mode: 'open',
      presentationStyle: 'fullScreen',
      type: [DocumentPicker.types.images],
    });
    handleFormData('image', result[0]);
    if (result) {
      handleCloseModel();
    }
  };
  const convertToMultipart = new FormData();
  const {mutateAsync: handleSubmit} = useMutation({
    mutationFn: () => handleCreateNewGroup(),
    onSuccess: data => {
      if (data.status == 'ok') {
        queryClient.invalidateQueries({queryKey: ['groups']});
        navigation.navigate('Home');
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
      } else {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
      }
    },
  });
  const handleCreateNewGroup = () => {
    console.log('test');
    if (!err && formData.group_name !== '') {
      handleFormData('isDeleteImg', false);

      setisProcessing(true);

      Object.entries(formData).forEach(([key, value]) =>
        convertToMultipart.append(key, value),
      );
      selectedIds.forEach((id, index) => {
        convertToMultipart.append('members[]', id);
      });
      const DATA = {
        id: Data._id,
        token: Data.accessToken,
        formData: convertToMultipart,
      };
      const response = CreateNewGroup(DATA).then(response => {
        setisProcessing(false);
        return response;
      });
      return response;
    } else {
      handleValidation('group_name', formData.group_name);
      return {status: 'error', message: 'error'};
    }
  };
  const handleValidation = (name, value) => {
    if (name == 'group_name') {
      if (!value) {
        seterr(true);
        seterrMsg('Group name is required');
      } else {
        if (value.length > 0) {
          seterr(false);
        } else {
          seterr(true);
          seterrMsg('Group name is required');
        }
      }
    }
  };
  const handleOnchange = (name, value) => {
    handleValidation(name, value);
    handleFormDatas(name, value);
  };
  const handleFormDatas = (name, value) => {
    setformData(prev => ({...prev, [name]: value}));
  };

  const handleCloseModel = () => {
    setopenImageModel(false);
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10,
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      alignSelf: 'flex-start',
      marginLeft: 20,
    },
    contentContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      gap: 20,
    },
    title: {
      fontSize: 20,
      color: jersAppTheme.themeText,
      fontWeight: '500',
    },
    input: {
      backgroundColor: 'transparent',
      width: '90%',
    },
    button: {
      backgroundColor: jersAppTheme.themeText,
      marginTop: 50,
    },
  });
  return (
    <SurfaceLayout
      toggleSelection={toggleSelection}
      title={'Create Group'}
      showBack={{
        state: true,
        onClick: () => {
          navigation.navigate('AddParticipants');
        },
      }}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={{position: 'relative'}}>
            {formData.image ? (
              <Avatar.Image
                size={200}
                source={{
                  uri: formData.image.url
                    ? formData.image.url
                    : formData.image.uri,
                }}
              />
            ) : (
              <Avatar.Image
                size={200}
                source={require('../src/assets/user.png')}
              />
            )}
            <IconButton
              style={{
                bottom: 0,
                position: 'absolute',
                right: 5,
                backgroundColor: jersAppTheme.badgeColor,
                padding: 10,
              }}
              icon={() => (
                <Image
                  style={{
                    height: 25,
                    width: 25,
                  }}
                  source={require('../src/assets/camera.png')}
                />
              )}
              size={40}
              onPress={() => {
                setopenImageModel(true);
              }}
            />
          </View>
          <View style={{width: '100%', alignItems: 'center'}}>
            <TextInput
              value={formData.group_name}
              onChangeText={value => {
                handleOnchange('group_name', value);
              }}
              style={styles.input}
              underlineColor="gray"
              activeUnderlineColor="#92d4c7"
              placeholder="Name"
              keyboardType="default"
              textColor={jersAppTheme.title}
              error={err}
            />
            {err && <Text style={styles.errorText}>{errMsg}</Text>}
          </View>
        </View>
        <Button
          onPress={handleSubmit}
          mode="contained"
          style={styles.button}
          textColor={jersAppTheme.main}>
          {isProcessing ? (
            <ActivityIndicator animating={true} color={jersAppTheme.appBar} />
          ) : (
            'Create Group'
          )}
        </Button>
        <ProfilePicModel
          group={true}
          handleDltProfilePic={() => {
            handleFormData('image', null);
            handleFormData('isDeleteImg', true);
            handleCloseModel();
          }}
          isDeleteEnable={formData.image !== null && formData.image !== 'null'}
          visible={openImageModel}
          setVisible={setopenImageModel}
          handlePick={handlePick}
          handleCamera={() => {
            handleCloseModel();
            navigation.navigate('AddStatus', {
              onlyCamera: true,
              group: true,
            });
          }}
        />
      </View>
    </SurfaceLayout>
  );
}
