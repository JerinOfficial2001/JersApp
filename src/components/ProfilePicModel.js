import * as React from 'react';
import {
  Modal,
  Portal,
  Text,
  Button,
  PaperProvider,
  IconButton,
} from 'react-native-paper';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {MyContext} from '../../App';

const ProfilePicModel = ({
  visible,
  setVisible,
  handlePick,
  handleDltProfilePic,
  handleCamera,
  isDeleteEnable,
  group,
}) => {
  const {jersAppTheme} = React.useContext(MyContext);
  const hideModal = () => setVisible(false);
  const BtnArr = [
    {
      name: 'Camera',
      image: (
        <MaterialCommunityIcons
          color={jersAppTheme.badgeTextColor}
          name="camera"
          size={25}
        />
      ),
      onClick: handleCamera,
      isEnabled: true,
    },
    {
      name: 'Gallery',
      image: (
        <Ionicons name="image" color={jersAppTheme.badgeTextColor} size={25} />
      ),
      onClick: handlePick,
      isEnabled: true,
    },
    {
      name: 'Delete',
      image: (
        <MaterialCommunityIcons
          color={!isDeleteEnable ? '#686868' : jersAppTheme.badgeTextColor}
          name="delete"
          size={25}
        />
      ),
      onClick: handleDltProfilePic,
      isEnabled: isDeleteEnable,
    },
  ];
  const styles = StyleSheet.create({
    container: {
      backgroundColor: jersAppTheme.model,
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
          <Ionicons name="close" color={jersAppTheme.title} size={25} />
        </TouchableOpacity>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              color: jersAppTheme.title,
              fontWeight: 'bold',
              fontSize: 20,
            }}>
            {group ? 'Group Photo' : 'Profile photo'}
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
                disabled={!elem.isEnabled}
                style={{
                  backgroundColor: !elem.isEnabled
                    ? 'gray'
                    : jersAppTheme.badgeColor,
                  padding: 10,
                }}
                icon={() =>
                  // <Image
                  //   style={{
                  //     height: 25,
                  //     width: 25,
                  //   }}
                  //   source={elem.image}
                  // />
                  elem.image
                }
                size={40}
                onPress={elem.onClick}
              />
              <Text
                style={{
                  color: jersAppTheme.title,
                  fontWeight: 'bold',
                  fontSize: 10,
                }}>
                {elem.name}
              </Text>
            </View>
          ))}
        </View>
      </Modal>
    </Portal>
  );
};

export default ProfilePicModel;
