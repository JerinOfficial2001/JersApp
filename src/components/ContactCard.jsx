import React, {useContext, useEffect, useState} from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {Avatar, Text} from 'react-native-paper';
import DonutChart from './DonutChart';
import {getLastMsg} from '../controllers/chats';
import {GetUsersByID} from '../controllers/auth';
import {DarkThemeSchema, JersAppThemeSchema} from '../../utils/theme';
import {MyContext} from '../../App';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';

const ContactCard = ({
  onclick,
  onLongPress,
  isSelected,
  showSelectedIcon,
  customImg,
  isDisabled,
  name,
  date,
  badgeCount,
  lastMsg,
  title,
  role,
  file,
  id,
  url,
  uri,
}) => {
  const navigation = useNavigation();
  // const [theme, settheme] = useState(JersAppThemeSchema);
  const {jersAppTheme, setpageName} = useContext(MyContext);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: isSelected
          ? jersAppTheme.selectedColor
          : 'transparent',
        borderRadius: 10,
      }}
      onLongPress={onLongPress}
      onPress={onclick}>
      <View
        style={{
          height: 80,
          marginBottom: 5,
          width: '100%',
          flexDirection: 'row',
          gap: 15,
          alignItems: 'center',
          padding: 3,
          borderRadius: 20,
          paddingHorizontal: 10,
          // backgroundColor: '#00000030',
        }}>
        {file && (
          <View style={{position: 'relative'}}>
            <Avatar.Image
              size={50}
              source={{uri: file[file.length - 1]?.url}}
            />
            <DonutChart width={175} height={50} data={file} />
            {title == 'My status' && (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('AddStatus', {
                    onlyCamera: false,
                    id,
                  });
                }}
                style={{
                  position: 'absolute',
                  right: -6,
                  bottom: -3,
                  backgroundColor: jersAppTheme.loader,
                  borderRadius: 50,
                }}>
                <Ionicons
                  name="add-circle-sharp"
                  size={25}
                  color={jersAppTheme.statusIndicator}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
        {uri && <Avatar.Image size={50} source={{uri}} />}
        {url && <Avatar.Image size={50} source={{uri: url}} />}
        {title == 'My status' && (
          <View style={{position: 'relative'}}>
            <Image
              source={require('../assets/user.png')}
              style={{height: 50, width: 50}}
            />
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('AddStatus', {
                  onlyCamera: false,
                  id,
                });
              }}
              style={{
                position: 'absolute',
                right: -6,
                bottom: -3,
                backgroundColor: jersAppTheme.main,
                borderRadius: 50,
              }}>
              <Ionicons
                name="add-circle-sharp"
                size={25}
                color={jersAppTheme.badgeColor}
              />
            </TouchableOpacity>
          </View>
        )}
        {!url && !uri ? (
          customImg ? (
            <View
              style={{
                height: 50,
                width: 50,
                borderRadius: 100,
                backgroundColor: jersAppTheme.appBar,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {customImg}
            </View>
          ) : (
            <Image
              source={require('../assets/user.png')}
              style={{height: 50, width: 50}}
            />
          )
        ) : null}
        <View
          style={{
            gap: 7,
            width: '82%',
          }}>
          {(name || title || lastMsg || date || badgeCount) && (
            <View
              style={{
                gap: 7,
                justifyContent: 'space-between',
                flexDirection: 'row',
              }}>
              {name && (
                <Text
                  style={{
                    color: isDisabled
                      ? jersAppTheme.disabled
                      : jersAppTheme.title,
                    fontWeight: 'bold',
                    fontSize: 15,
                  }}>
                  {name}
                </Text>
              )}
              {(badgeCount || date) && (
                <View
                  style={{
                    position: 'absolute',
                    right: 0,
                    gap: 7,
                    alignItems: 'center',
                    zIndex: 1,
                  }}>
                  {date && (
                    <Text style={{color: jersAppTheme.subText}}>{date}</Text>
                  )}
                  {badgeCount != 0 && badgeCount && badgeCount != '' && (
                    <View
                      style={{
                        backgroundColor: jersAppTheme.badgeColor,
                        height: 25,
                        width: 25,
                        borderRadius: 100,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text style={{color: jersAppTheme.badgeTextColor}}>
                        {badgeCount <= '99' ? badgeCount : '99+'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
          {(lastMsg || title) && (
            <Text
              style={{
                color: isDisabled
                  ? jersAppTheme.disabled
                  : title
                  ? jersAppTheme.title
                  : jersAppTheme.subText,
                width: '85%',
              }}
              numberOfLines={1}>
              {title ? title : `${lastMsg.name}:` + lastMsg.msg}
            </Text>
          )}
        </View>
        {showSelectedIcon && (
          <View
            style={{
              position: 'absolute',
              right: 10,
              gap: 7,
              alignItems: 'center',
              zIndex: 1,
            }}>
            <View
              style={{
                backgroundColor: isSelected
                  ? jersAppTheme.badgeColor
                  : 'transparent',
                height: 30,
                width: 30,
                borderRadius: 100,
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: jersAppTheme.selectedColor,
                borderWidth: 2,
              }}>
              {isSelected && (
                <AntDesignIcon
                  size={24}
                  name="check"
                  color={jersAppTheme.headerText}
                />
              )}
            </View>
          </View>
        )}
        {(role || isDisabled) && (
          <View
            style={{
              position: 'absolute',
              right: 10,
              gap: 7,
              alignItems: 'center',
              zIndex: 1,
              borderColor: 'green',
              borderWidth: 2,
              padding: 2,
              borderRadius: 50,
              paddingHorizontal: 10,
            }}>
            <Text style={{color: 'green'}}>
              {isDisabled ? 'Already in group' : role}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ContactCard;
