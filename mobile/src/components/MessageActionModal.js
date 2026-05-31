import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MessageActionModal = ({
  visible,
  handleClose,
  handleDeleteForMe,
  handleDeleteForEveryone,
  showDeleteForEveryone,
  jersAppTheme,
}) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={[
          styles.containerStyle,
          { backgroundColor: jersAppTheme.model || '#2D3544' },
        ]}
        style={styles.modal}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleDeleteForMe}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={24}
              color={jersAppTheme.title || 'white'}
            />
            <Text style={[styles.actionText, { color: jersAppTheme.title }]}>
              Delete for me
            </Text>
          </TouchableOpacity>

          {showDeleteForEveryone && (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleDeleteForEveryone}
            >
              <MaterialCommunityIcons
                name="delete-forever-outline"
                size={24}
                color="#E53E3E"
              />
              <Text style={[styles.actionText, { color: '#E53E3E' }]}>
                Delete for everyone
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelRow} onPress={handleClose}>
            <Text
              style={[
                styles.cancelText,
                { color: jersAppTheme.placeholderColor || 'gray' },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  containerStyle: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginHorizontal: 0,
    marginBottom: 0,
  },
  content: {
    gap: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelRow: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffffff1a',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MessageActionModal;
