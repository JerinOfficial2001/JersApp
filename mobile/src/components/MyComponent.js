import React, {useContext, useRef} from 'react';
import {Animated, Image, Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import {Avatar} from 'react-native-paper';
import DonutChart from './DonutChart';
import {MyContext} from '../../App';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function getAvatarColor(name) {
  const colors = ['#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#3182CE', '#805AD5', '#D53F8C'];
  return colors[(name?.charCodeAt(0) || 0) % colors.length];
}

const MyComponent = ({
  onclick,
  style,
  status,
  contact,
  contactPg,
  onLongPress,
  newMsgcount,
  isSelected,
  showSelectedIcon,
  customImg,
  isDisabled,
  onRightIconPress,
}) => {
  const navigation = useNavigation();
  const {jersAppTheme} = useContext(MyContext);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {toValue: 0.97, useNativeDriver: true}).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {toValue: 1, useNativeDriver: true}).start();
  };

  const displayName = !contactPg
    ? contact?.ContactDetails?.name || contact?.name || 'Unknown'
    : contact?.name || 'Unknown';

  const hasUnread = Boolean(newMsgcount && newMsgcount !== '0' && newMsgcount !== 0);

  const renderAvatar = () => {
    if (status?.file) {
      const latestFile = status.file[status.file.length - 1];
      const hasValidUrl = latestFile?.url &&
        latestFile.url !== 'null' &&
        latestFile.url !== 'undefined' &&
        latestFile.url.trim() !== '' &&
        latestFile.url.startsWith('http');
      return (
        <View style={styles.avatarWrapper}>
          {latestFile?.isText ? (
            <View
              style={[
                styles.avatarImg,
                {
                  backgroundColor: latestFile.backgroundColor || '#075E54',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}>
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 12}} numberOfLines={1}>
                {latestFile.text?.substring(0, 5)}
              </Text>
            </View>
          ) : !hasValidUrl ? (
            <Image source={require('../assets/user.png')} style={styles.avatarImg} />
          ) : (
            <Avatar.Image
              size={54}
              source={{uri: latestFile.url}}
            />
          )}
          <DonutChart data={status?.file} />
          {status.title === 'My status' && (
            <View
              style={[
                styles.addStatusBtn,
                {
                  backgroundColor: '#25D366', // WhatsApp green
                  borderColor: jersAppTheme.main, // match background
                  borderWidth: 2,
                },
              ]}>
              <Ionicons name="add" size={14} color="white" />
            </View>
          )}
        </View>
      );
    }

    if (contact?.image?.url && contact.image.url !== 'null' && contact.image.url !== 'undefined') {
      return <Avatar.Image size={54} source={{uri: contact.image.url}} />;
    }

    if (contact?.ContactDetails?.image?.url && contact.ContactDetails.image.url !== 'null' && contact.ContactDetails.image.url !== 'undefined') {
      return <Avatar.Image size={54} source={{uri: contact.ContactDetails.image.url}} />;
    }

    if (status?.title === 'My status') {
      return (
        <View style={styles.avatarWrapper}>
          <Image source={require('../assets/user.png')} style={styles.avatarImg} />
          <View
            style={[
              styles.addStatusBtnPlain,
              {
                backgroundColor: '#25D366', // WhatsApp green
                borderColor: jersAppTheme.main,
                borderWidth: 2,
              },
            ]}>
            <Ionicons name="add" size={14} color="white" />
          </View>
        </View>
      );
    }

    if (customImg) {
      return (
        <View style={[styles.customImgWrapper, {backgroundColor: jersAppTheme.appBar}]}>
          {customImg}
        </View>
      );
    }

    // Colorful fallback avatar
    if (displayName) {
      return (
        <View style={[styles.fallbackAvatar, {backgroundColor: getAvatarColor(displayName)}]}>
          <Text style={styles.fallbackInitial}>
            {displayName[0]?.toUpperCase() || '?'}
          </Text>
        </View>
      );
    }

    return (
      <Image source={require('../assets/user.png')} style={styles.avatarImg} />
    );
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: isSelected
              ? jersAppTheme.selectedColor || jersAppTheme.badgeColor + '20'
              : 'transparent',
          },
        ]}
        onLongPress={onLongPress}
        onPress={onclick}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>

        {/* Avatar */}
        {renderAvatar()}

        {/* Text content */}
        <View style={styles.textArea}>
          <View style={styles.topRow}>
            <Text
              style={[
                styles.name,
                {
                  color: isDisabled ? jersAppTheme.disabled : jersAppTheme.title,
                },
              ]}
              numberOfLines={1}>
              {status ? (status.title || status.userName) : displayName}
            </Text>
            {!status && !contactPg && (
              <View style={styles.metaRight}>
                <Text style={[styles.dateText, {color: jersAppTheme.subText}]}>
                  {contact?.date || ''}
                </Text>
                {hasUnread && (
                  <View
                    style={[styles.badge, {backgroundColor: jersAppTheme.badgeColor}]}>
                    <Text
                      style={[
                        styles.badgeText,
                        {color: jersAppTheme.badgeTextColor || 'white'},
                      ]}>
                      {newMsgcount > 99 ? '99+' : newMsgcount}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Subtitle / last message */}
          {(contact?.mobNum ||
            contact?.lastMsg ||
            status) && (
            <Text
              style={[
                styles.subtitle,
                {
                  color: isDisabled
                    ? jersAppTheme.disabled
                    : jersAppTheme.subText,
                  fontWeight: hasUnread ? '500' : '400',
                },
              ]}
              numberOfLines={1}>
              {contactPg
                ? contact?.mobNum || 'Phone Number'
                : status
                ? status.emptySubtitle || (status.createdAt ? new Date(status.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now')
                : contact?.lastMsg?.msg
                ? contact?.lastMsg?.name === 'You'
                  ? `You: ${contact?.lastMsg?.msg}`
                  : contact?.lastMsg?.name
                  ? `${contact?.lastMsg?.name}: ${contact?.lastMsg?.msg}`
                  : contact?.lastMsg?.msg
                : ''}
            </Text>
          )}
        </View>

        {/* Three dots for My Status details */}
        {status?.title === 'My status' && status?.file && status?.file.length > 0 && (
          <TouchableOpacity
            style={{padding: 10, marginMinus: -5}}
            onPress={(e) => {
              if (onRightIconPress) {
                onRightIconPress();
              }
            }}>
            <MaterialCommunityIcons name="dots-horizontal" size={24} color={jersAppTheme.subText} />
          </TouchableOpacity>
        )}

        {/* Selection checkbox */}
        {showSelectedIcon && (
          <View style={styles.selectionIcon}>
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: isSelected ? jersAppTheme.badgeColor : 'transparent',
                  borderColor: isSelected ? jersAppTheme.badgeColor : jersAppTheme.placeholderColor,
                },
              ]}>
              {isSelected && (
                <AntDesignIcon size={16} name="check" color="white" />
              )}
            </View>
          </View>
        )}

        {/* Role badge (group members) */}
        {((contact?.role && contact.role !== 'MEMBER') || isDisabled) && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {isDisabled ? 'In group' : contact.role}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 14,
    borderRadius: 4,
  },
  avatarWrapper: {
    position: 'relative',
    width: 54,
    height: 54,
  },
  avatarImg: {
    height: 54,
    width: 54,
    borderRadius: 27,
  },
  addStatusBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderRadius: 50,
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStatusBtnPlain: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderRadius: 50,
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customImgWrapper: {
    height: 54,
    width: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  textArea: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  metaRight: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: 8,
  },
  dateText: {
    fontSize: 11,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
  },
  selectionIcon: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    zIndex: 1,
  },
  checkbox: {
    height: 26,
    width: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  roleBadge: {
    borderColor: '#38A169',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roleText: {
    color: '#38A169',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default MyComponent;
