import {View, Text, TouchableOpacity} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {MyContext} from '../../App';
import {Avatar, IconButton} from 'react-native-paper';
import Plus from '../assets/svg/plus';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {GetUsersFromIds, getAllUsers} from '../controllers/auth';
import {useMutation, useQuery} from '@tanstack/react-query';

export default function SurfaceLayout({
  children,
  title,
  ShowNavigationBtn,
  onClick,
  toggleSelection,
  showBack,
  group,
}) {
  const {jersAppTheme, selectedIds} = useContext(MyContext);
  const [UsersInArray, setUsersInArray] = useState([]);
  useEffect(() => {
    if (selectedIds && selectedIds.length > 0) {
      GetUsersFromIds({ids: selectedIds}).then(data => {
        setUsersInArray(data);
      });
    }
  }, [selectedIds?.length]);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: jersAppTheme.appBar,
      }}>
      {selectedIds && selectedIds.length !== 0 && (
        <View
          style={{
            width: '100%',
            padding: 10,
            flexDirection: 'row',
            gap: 22,
            flexWrap: 'wrap',
          }}>
          {UsersInArray.map(elem => {
            return (
              <View
                key={elem._id}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  width: 60,
                }}>
                <Avatar.Image
                  size={60}
                  source={
                    elem.image
                      ? {uri: elem.image.url}
                      : require('../assets/user.png')
                  }
                />
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: -1,
                    right: -7,
                    backgroundColor: 'red',
                    borderRadius: 100,
                  }}
                  onPress={() => {
                    toggleSelection(elem._id);
                  }}>
                  <AntDesignIcon
                    size={24}
                    name="closecircle"
                    color={jersAppTheme.headerText}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    color: jersAppTheme.themeText,
                    fontWeight: 'bold',
                    fontSize: 13,
                  }}>
                  {elem.name}
                </Text>
              </View>
            );
          })}
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
          <Avatar.Image
            size={100}
            source={
              group.image
                ? {uri: group.image.url}
                : require('../assets/user.png')
            }
            style={{marginBottom: 15}}
          />
          <Text
            style={{
              color: jersAppTheme.headerText,
              fontSize: 20,
              fontWeight: 'bold',
            }}>
            {group.name}
          </Text>
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
              {title == 'Groups' ? (
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
