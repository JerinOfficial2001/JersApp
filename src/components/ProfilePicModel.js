import * as React from 'react';
import {
  Modal,
  Portal,
  Text,
  Button,
  PaperProvider,
  IconButton,
} from 'react-native-paper';
import InputField from './InputField';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';

const ProfilePicModel = ({
  visible,
  setVisible,
  handlePick,
  handleDltProfilePic,
  handleCamera,
}) => {
  const hideModal = () => setVisible(false);

  const BtnArr = [
    {
      name: 'Camera',
      image: require('../assets/camera.png'),
      onClick: handleCamera,
    },
    {
      name: 'Gallery',
      image: require('../assets/imageBlack.png'),
      onClick: handlePick,
    },
    {
      name: 'Delete',
      image: require('../assets/deleteBlack.png'),
      onClick: handleDltProfilePic,
    },
  ];
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={{position: 'absolute', right: 10, top: 10}}
          onPress={() => {
            setVisible(false);
          }}>
          <Image
            style={{
              height: 30,
              width: 30,
            }}
            source={require('../assets/clear.png')}
          />
        </TouchableOpacity>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text style={{color: 'white', fontWeight: 'bold', fontSize: 20}}>
            Profile photo
          </Text>
        </View>

        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
          {BtnArr.map((elem, index) => (
            <View
              key={index}
              style={{alignItems: 'center', justifyContent: 'center'}}>
              <IconButton
                style={{
                  backgroundColor: '#008069',
                  padding: 10,
                  borderColor: 'gray',
                  borderWidth: 1,
                }}
                icon={() => (
                  <Image
                    style={{
                      height: 25,
                      width: 25,
                    }}
                    source={elem.image}
                  />
                )}
                size={40}
                onPress={elem.onClick}
              />
              <Text
                style={{color: '#CECECED1', fontWeight: 'bold', fontSize: 10}}>
                {elem.name}
              </Text>
            </View>
          ))}
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#008069',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});

export default ProfilePicModel;
