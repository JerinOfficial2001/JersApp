import * as React from 'react';
import {Modal, Portal, Text, Button, PaperProvider} from 'react-native-paper';
import InputField from './InputField';
import {Image, TouchableOpacity} from 'react-native';

const AuthModal = ({visible, setVisible}) => {
  const hideModal = () => setVisible(false);
  const containerStyle = {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={containerStyle}>
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
        <Text style={{color: 'black', fontWeight: 'bold', fontSize: 30}}>
          Login
        </Text>
        {[1, 2].map(elem => (
          <InputField key={elem} />
        ))}
        <Button mode="contained">Login</Button>
      </Modal>
    </Portal>
  );
};

export default AuthModal;
