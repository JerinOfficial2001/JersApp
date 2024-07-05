import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
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

export default function CreateGroup({route, ...props}) {
  const {Data, jersAppTheme} = useContext(MyContext);
  const {ids, image} = route.params;
  const [selectedIds, setSelectedIds] = useState(ids);

  const toggleSelection = contactId => {
    if (selectedIds.includes(contactId)) {
      setSelectedIds(selectedIds.filter(id => id !== contactId)); // Deselect
    } else {
      setSelectedIds([...selectedIds, contactId]); // Select
    }
  };

  const [isProcessing, setisProcessing] = useState(false);
  const [openImageModel, setopenImageModel] = useState(false);
  const [formData, setformData] = useState({
    name: '',
    image: image ? image : null,
    public_id: null,
    isDeleteImg: false,
  });
  const [err, seterr] = useState(false);
  const [errMsg, seterrMsg] = useState('');
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

  const handleSubmit = () => {
    if (!err && formData.name !== '') {
      handleFormData('isDeleteImg', false);

      setisProcessing(true);

      Object.entries(formData).forEach(([key, value]) =>
        convertToMultipart.append(key, value),
      );
      const DATA = {
        id,
        formData: convertToMultipart,
      };
      // UpdateProfile(DATA).then(response => {
      //   if (response?.status == 'ok') {
      //     ToastAndroid.show(response.message, ToastAndroid.SHORT);
      //   } else {
      //     ToastAndroid.show(response.message, ToastAndroid.SHORT);
      //   }
      //   setisProcessing(false);
      // });
    } else {
      handleValidation('name', formData.name);
    }
  };
  const handleValidation = (name, value) => {
    if (name == 'name') {
      if (!value) {
        seterr(true);
        seterrMsg('Name is required');
      } else {
        if (value.length > 0) {
          seterr(false);
        } else {
          seterr(true);
          seterrMsg('Name is required');
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
      Ids={selectedIds}
      toggleSelection={toggleSelection}
      title={'Create Group'}
      showBack={{
        state: true,
        onClick: () => {
          props.navigation.navigate('AddParticipants', {ids: selectedIds});
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
              value={formData.name}
              onChangeText={value => {
                handleOnchange('name', value);
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
            props.navigation.navigate('AddStatus', {
              onlyCamera: true,
              id: ids,
              group: true,
            });
          }}
        />
      </View>
    </SurfaceLayout>
  );
}
