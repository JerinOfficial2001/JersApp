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

  const hasUnread = newMsgcount && newMsgcount !== '0' && newMsgcount !== 0;

  const renderAvatar = () => {
    if (status?.file) {
      return (
        <View style={styles.avatarWrapper}>
          <Avatar.Image
            size={54}
            source={{uri: status.file[status.file.length - 1]?.url}}
          />
          <DonutChart width={175} height={54} data={status?.file} />
          {status.title === 'My status' && (
            <TouchableOpacity
              onPress={() => navigation.navigate('AddStatus', {onlyCamera: false, id: status?.id})}
              style={[styles.addStatusBtn, {backgroundColor: jersAppTheme.loader}]}>
              <Ionicons name="add-circle-sharp" size={22} color={jersAppTheme.statusIndicator} />
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (contact?.image?.url) {
      return <Avatar.Image size={54} source={{uri: contact.image.url}} />;
    }

    if (contact?.ContactDetails?.image?.url) {
      return <Avatar.Image size={54} source={{uri: contact.ContactDetails.image.url}} />;
    }

    if (status?.title === 'My status') {
      return (
        <View style={styles.avatarWrapper}>
          <Image source={require('../assets/user.png')} style={styles.avatarImg} />
          <TouchableOpacity
            onPress={() => navigation.navigate('AddStatus', {onlyCamera: false, id: status?.id})}
            style={[styles.addStatusBtnPlain, {backgroundColor: jersAppTheme.main}]}>
            <Ionicons name="add-circle-sharp" size={22} color={jersAppTheme.badgeColor} />
          </TouchableOpacity>
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
          {!status && (
            <View style={styles.topRow}>
              <Text
                style={[
                  styles.name,
                  {
                    color: isDisabled ? jersAppTheme.disabled : jersAppTheme.title,
                  },
                ]}
                numberOfLines={1}>
                {displayName}
              </Text>
              {!contactPg && (
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
          )}

          {/* Subtitle / last message */}
          {(contact?.mobNum ||
            contact?.lastMsg ||
            status?.title ||
            status?.userName) && (
            <Text
              style={[
                styles.subtitle,
                {
                  color: isDisabled
                    ? jersAppTheme.disabled
                    : status?.title || status?.userName
                    ? jersAppTheme.title
                    : jersAppTheme.subText,
                  fontWeight: hasUnread ? '500' : '400',
                },
              ]}
              numberOfLines={1}>
              {contactPg
                ? contact?.mobNum || 'Phone Number'
                : status
                ? status?.title || status?.userName
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
    right: -5,
    bottom: -3,
    borderRadius: 50,
  },
  addStatusBtnPlain: {
    position: 'absolute',
    right: -5,
    bottom: -3,
    borderRadius: 50,
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
