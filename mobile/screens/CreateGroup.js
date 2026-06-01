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
      color: '#ff4d4d',
      fontSize: 13,
      fontWeight: '500',
      alignSelf: 'flex-start',
      marginTop: 4,
      marginLeft: 10,
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
      width: '100%',
      fontSize: 18,
    },
    button: {
      backgroundColor: jersAppTheme.badgeColor,
      marginTop: 40,
      paddingVertical: 8,
      borderRadius: 30,
      width: '90%',
      alignSelf: 'center',
      shadowColor: jersAppTheme.badgeColor,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 6,
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
          <View style={{position: 'relative', marginBottom: 20}}>
            <View style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 10},
                shadowOpacity: 0.2,
                shadowRadius: 20,
                elevation: 10,
                borderRadius: 100,
                borderWidth: 4,
                borderColor: jersAppTheme.main,
            }}>
                {formData.image ? (
                  <Avatar.Image
                    size={160}
                    source={{
                      uri: formData.image.url
                        ? formData.image.url
                        : formData.image.uri,
                    }}
                  />
                ) : (
                  <Avatar.Image
                    size={160}
                    source={require('../src/assets/user.png')}
                  />
                )}
            </View>
            <IconButton
              style={{
                bottom: -5,
                position: 'absolute',
                right: -5,
                backgroundColor: jersAppTheme.badgeColor,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 5,
                borderWidth: 3,
                borderColor: jersAppTheme.main,
              }}
              icon={() => (
                <Image
                  style={{
                    height: 20,
                    width: 20,
                    tintColor: '#fff'
                  }}
                  source={require('../src/assets/camera.png')}
                />
              )}
              size={36}
              onPress={() => {
                setopenImageModel(true);
              }}
            />
          </View>
          <View style={{width: '90%', alignItems: 'center'}}>
            <View style={{
                width: '100%',
                backgroundColor: jersAppTheme.appBar,
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 4,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
            }}>
                <TextInput
                  value={formData.group_name}
                  onChangeText={value => {
                    handleOnchange('group_name', value);
                  }}
                  style={styles.input}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  placeholder="Group Name"
                  keyboardType="default"
                  textColor={jersAppTheme.title}
                  error={err}
                />
            </View>
            {err && <Text style={styles.errorText}>{errMsg}</Text>}
          </View>
        </View>
        <Button
          onPress={handleSubmit}
          mode="contained"
          style={styles.button}
          labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
          {isProcessing ? (
            <ActivityIndicator animating={true} color="#fff" />
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
