import * as React from 'react';
import {Modal, Portal, Text, Button, PaperProvider} from 'react-native-paper';
import InputField from './InputField';
import {Image, TouchableOpacity, View} from 'react-native';

const DeleteModal = ({handleModelClose, visible, handleDelete}) => {
  const containerStyle = {
    backgroundColor: '#3b4a54',
    padding: 20,
    margin: 20,
    borderRadius: 30,
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleModelClose}
        contentContainerStyle={containerStyle}>
        <Text style={{color: 'gray', fontSize: 14}}>Delete message?</Text>

        <View
          style={{
            width: '100%',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 20,
          }}>
          <Button textColor="#14a95f" mode="text" onPress={handleModelClose}>
            Cancel
          </Button>
          <Button textColor="#14a95f" mode="text" onPress={handleDelete}>
            Delete
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default DeleteModal;
