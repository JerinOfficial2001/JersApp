import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {MyContext} from '../../App';
import {ActivityIndicator, Avatar, IconButton} from 'react-native-paper';
import Plus from '../assets/svg/plus';
import {GetUsersFromIds, getAllUsers} from '../controllers/auth';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useMutation, useQuery} from '@tanstack/react-query';

export default function SurfaceLayout({
  children,
  title,
  ShowNavigationBtn,
  onClick,
  toggleSelection,
  showBack,
  group,
  ids,
  isProcessing,
}) {
  const {jersAppTheme, selectedIds} = useContext(MyContext);
  const [UsersInArray, setUsersInArray] = useState([]);
  useEffect(() => {
    if (selectedIds && selectedIds.length > 0) {
      GetUsersFromIds({ids: selectedIds}).then(data => {
        setUsersInArray(data);
      });
    } else if (ids && ids.length > 0) {
      GetUsersFromIds({ids}).then(data => {
        setUsersInArray(data);
      });
    }
  }, [selectedIds?.length, ids?.length]);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: jersAppTheme.appBar,
      }}>
      {((selectedIds && selectedIds.length !== 0) ||
        (ids && ids.length !== 0)) && (
        <View
          style={{
            width: '100%',
            padding: 10,
            // flexDirection: 'row',
            // flexWrap: 'wrap',
            height: 150,
          }}>
          {ids && ids.length > 0 && (
            <View style={{width: '100%', marginBottom: 10}}>
              <Text style={{color: jersAppTheme.placeholderColor}}>
                Active users
              </Text>
            </View>
          )}
          <FlatList
            horizontal
            contentContainerStyle={{minHeight: 50}}
            data={UsersInArray}
            renderItem={({item}) => {
              return (
                <View
                  key={item._id}
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    width: 60,
                    marginLeft: 13,
                  }}>
                  <Avatar.Image
                    size={60}
                    source={
                      item.image
                        ? {uri: item.image.url}
                        : require('../assets/user.png')
                    }
                  />
                  {!ids && ids?.length == 0 && (
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        top: -1,
                        right: -7,
                        backgroundColor: 'red',
                        borderRadius: 100,
                      }}
                      onPress={() => {
                        toggleSelection(item._id);
                      }}>
                      <AntDesignIcon
                        size={24}
                        name="closecircle"
                        color={jersAppTheme.headerText}
                      />
                    </TouchableOpacity>
                  )}
                  <Text
                    style={{
                      color: jersAppTheme.themeText,
                      fontWeight: 'bold',
                      fontSize: 13,
                    }}>
                    {item.name}
                  </Text>
                </View>
              );
            }}
          />
        </View>
      )}
      {group && (
        <View
          style={{
            width: '100%',
            padding: 10,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View>
            <Avatar.Image
              size={100}
              source={
                group.image
                  ? {uri: group.image.url}
                  : require('../assets/user.png')
              }
              style={{marginBottom: 15}}
            />
            {group.IsAdmin && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 2,
                  bottom: 15,
                  backgroundColor: jersAppTheme.badgeColor,
                  borderRadius: 50,
                  padding: 5,
                }}>
                <MaterialIcons
                  size={20}
                  name="photo-camera"
                  color={jersAppTheme.headerText}
                />
              </TouchableOpacity>
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}>
            <Text
              style={{
                color: jersAppTheme.headerText,
                fontSize: 20,
                fontWeight: 'bold',
                marginLeft: 25,
              }}>
              {group.name}
            </Text>
            {group.IsAdmin && (
              <TouchableOpacity
                style={{
                  borderRadius: 50,
                  padding: 5,
                }}>
                <AntDesignIcon
                  size={20}
                  name="edit"
                  color={jersAppTheme.headerText}
                />
              </TouchableOpacity>
            )}
          </View>

          <Text
            style={{
              color: jersAppTheme.subText,
              fontSize: 13,
            }}>
            {`${group.members} members`}
          </Text>
        </View>
      )}
      <View
        style={{
          flex: 1,
          borderTopRightRadius: 25,
          borderTopLeftRadius: 25,
          backgroundColor: jersAppTheme.main,
          elevation: 2,
          shadowColor: 'white',
          shadowOpacity: 2,
          marginTop: 1,
        }}>
        {title && (
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              height: 50,
              justifyContent: 'center',
              flexDirection: 'row',
            }}>
            {showBack && showBack.state == true && (
              <TouchableOpacity
                onPress={showBack.onClick}
                style={{position: 'absolute', left: 20}}>
                <AntDesignIcon
                  size={24}
                  name="back"
                  color={jersAppTheme.headerText}
                />
              </TouchableOpacity>
            )}
            <Text
              style={{
                color: jersAppTheme.themeText,
                fontWeight: 'bold',
                fontSize: 20,
                textTransform: 'uppercase',
              }}>
              {title}
            </Text>
          </View>
        )}
        {children}
      </View>
      {ShowNavigationBtn && (
        <IconButton
          style={{
            bottom: 10,
            position: 'absolute',
            right: 10,
            backgroundColor: jersAppTheme.appBar,
            padding: 10,
          }}
          icon={() => (
            <View>
              {isProcessing ? (
                <ActivityIndicator
                  animating={true}
                  color={jersAppTheme.headerText}
                />
              ) : title == 'Groups' ? (
                <Plus color={jersAppTheme.headerText} />
              ) : (
                <AntDesignIcon
                  size={24}
                  name="arrowright"
                  color={jersAppTheme.headerText}
                />
              )}
            </View>
          )}
          size={40}
          onPress={onClick}
        />
      )}
    </View>
  );
}
