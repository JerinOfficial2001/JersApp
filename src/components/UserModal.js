import * as React from 'react';
import {Modal, Portal, Menu} from 'react-native-paper';
import {TouchableOpacity, ToastAndroid} from 'react-native';
import {MyContext} from '../../App';
import {useNavigation} from '@react-navigation/native';
import {createChat} from '../controllers/chats';
import {useMutation} from '@tanstack/react-query';
import {useSocketHook} from '../../utils/socket';
import {RemoveMembers, UpdateRole} from '../controllers/members';

const UserModal = ({handleModelClose, visible, handleSubmit, modalData}) => {
  const {jersAppTheme, Data} = React.useContext(MyContext);
  const {socketRemoveMember, socketUpdateRole} = useSocketHook();
  const containerStyle = {
    backgroundColor: jersAppTheme.model,
    padding: 20,
    margin: 20,
    borderRadius: 20,
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
  };
  const navigation = useNavigation();
  const {mutateAsync: AddChat} = useMutation({
    mutationFn: data => {
      createChat(data);
      return data;
    },
    onSuccess: data => {
      navigation.navigate('Message', {
        id: data?.receiver,
        userID: data.sender,
        receiverId: data?.receiver,
      });
      handleModelClose();
    },
  });
  const handleRemoveMember = () => {
    RemoveMembers({
      groupID: modalData.groupID,
      token: Data?.accessToken,
      id: Data?._id,
      memberID: modalData.id,
    }).then(res => {
      if (res) {
        if (res.status == 'ok') {
          socketRemoveMember({
            groupID: modalData.groupID,
            token: Data?.accessToken,
            userID: Data?._id,
            memberID: modalData.id,
          });
        } else {
          ToastAndroid.show(res.message, ToastAndroid.SHORT);
        }
      }
    });
  };
  const handleUpdateRole = () => {
    UpdateRole({
      groupID: modalData.groupID,
      token: Data?.accessToken,
      id: Data?._id,
      memberID: modalData.id,
      formData: {role: modalData?.isMemberAdmin ? 'MEMBER' : 'ADMIN'},
    }).then(res => {
      if (res) {
        if (res.status == 'ok') {
          socketUpdateRole({
            groupID: modalData.groupID,
            token: Data?.accessToken,
            userID: Data?._id,
            memberID: modalData.id,
            role: modalData?.isMemberAdmin ? 'MEMBER' : 'ADMIN',
          });
        } else {
          ToastAndroid.show(res.message, ToastAndroid.SHORT);
        }
      }
    });
  };
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleModelClose}
        contentContainerStyle={containerStyle}>
        <TouchableOpacity>
          <Menu.Item
            title={`Message ${modalData?.name}`}
            titleStyle={{color: jersAppTheme.title}}
            onPress={() => {
              AddChat({
                receiver: modalData?.user_id,
                sender: Data?._id,
              });
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Menu.Item
            title={`View ${modalData?.name}`}
            titleStyle={{color: jersAppTheme.title}}
            onPress={() => {
              handleModelClose();
            }}
          />
        </TouchableOpacity>
        {modalData?.IsAdmin && (
          <TouchableOpacity>
            <Menu.Item
              title={
                modalData?.isMemberAdmin
                  ? `Dismiss as admin`
                  : `Make group admin`
              }
              titleStyle={{color: jersAppTheme.title}}
              onPress={handleUpdateRole}
            />
          </TouchableOpacity>
        )}
        {modalData?.IsAdmin && (
          <TouchableOpacity>
            <Menu.Item
              title={`Remove ${modalData?.name}`}
              titleStyle={{color: jersAppTheme.title}}
              onPress={handleRemoveMember}
            />
          </TouchableOpacity>
        )}
      </Modal>
    </Portal>
  );
};

export default UserModal;
