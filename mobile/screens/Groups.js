import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MyContext } from '../App';
import { TopBarContext } from '../navigations/tabNavigation';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import MyComponent from '../src/components/MyComponent';
import { useSocketHook } from '../utils/socket';
import Loader from '../src/components/Loader';
import { Button } from 'react-native-paper';
import Plus from '../src/assets/svg/plus';
import { GetGroups } from '../src/controllers/group';

export default function Groups(props) {
  const { Data, jersAppTheme, setpageName, setSelectedIds } =
    useContext(MyContext);
  const [isMsgLongPressed, setisMsgLongPressed] = useState([]);
  const [receiversId, setreceiversId] = useState('');
  const [Contact_id, setContact_id] = useState('');

  const { setisDelete, isModelOpen, setisModelOpen, setopenMenu, setactiveTab } =
    useContext(TopBarContext);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => GetGroups({ id: Data?._id, token: Data?.accessToken }),
    enabled: !!Data && !!Data._id,
  });
  const {
    socket,
  } = useSocketHook();

  const handleLongPress = (index, id, Contact_id) => {
    setContact_id(Contact_id);
    const updatedStates = [...isMsgLongPressed];
    updatedStates[index].isSelected = true;
    setisMsgLongPressed(updatedStates);
    setisDelete(true);
    setreceiversId(id);
  };
  const handlePress = () => {
    const updatedStates = isMsgLongPressed?.map(() => ({ isSelected: false }));
    setisMsgLongPressed(updatedStates);
    setisDelete(false);
    setopenMenu(false);
  };
  const handleModelClose = () => {
    setisModelOpen(false);
    handlePress();
  };
  useFocusEffect(
    useCallback(() => {
      setSelectedIds([]);
      refetch();
    }, []),
  );

  useEffect(() => {
    if (socket) {
      const handleNewMsg = () => {
        refetch();
      };
      socket.on('new_group_msg', handleNewMsg);
      return () => {
        socket.off('new_group_msg', handleNewMsg);
      };
    }
  }, [socket, refetch]);

  return (
    <SurfaceLayout
      title="Groups"
      ShowNavigationBtn={true}
      onClick={() =>
        props.navigation.navigate('AddParticipants', { idsFromGroup: null })
      }>
      {isLoading ? (
        <Loader />
      ) : (
        <ScrollView style={{ padding: 10, backgroundColor: jersAppTheme.main }}>
          {data?.length > 0 ? (
            data?.map((elem, index) => {
              return (
                <View
                  key={index}
                  style={{
                    backgroundColor: 'transparent',
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: jersAppTheme.appBar + '40',
                    marginHorizontal: 0,
                  }}>
                  <MyComponent
                    contact={{
                      _id: elem._id,
                      ContactDetails: { name: elem.group_name },
                      image: elem.image && elem.image !== 'null' ? elem.image : null,
                      lastMsg: elem.last_msg,
                    }}
                    newMsgcount={elem.unread_msg || 0}
                    onclick={() => {
                      props.navigation.navigate('GroupMsg', {
                        id: elem._id,
                      });
                    }}
                  />
                </View>
              );
            })
          ) : (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                minHeight: 500,
                paddingHorizontal: 20
              }}>
              <View style={{
                backgroundColor: jersAppTheme.appBar,
                padding: 24,
                borderRadius: 100,
                marginBottom: 24,
                shadowColor: jersAppTheme.badgeColor,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 8,
              }}>
                <Plus width={64} height={64} fill={jersAppTheme.badgeColor} />
              </View>
              <Text style={{
                color: jersAppTheme.title,
                fontSize: 22,
                fontWeight: '700',
                marginBottom: 10,
                textAlign: 'center'
              }}>
                No Groups Yet
              </Text>
              <Text style={{
                color: jersAppTheme.subText,
                fontSize: 15,
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: 30,
                maxWidth: '80%'
              }}>
                Connect with friends and family by creating your first group!
              </Text>
              <Button
                mode="contained"
                onPress={() => props.navigation.navigate('AddParticipants', { idsFromGroup: null })}
                style={{
                  backgroundColor: jersAppTheme.badgeColor,
                  borderRadius: 30,
                  paddingHorizontal: 20,
                  paddingVertical: 4
                }}
                labelStyle={{ fontWeight: '700', fontSize: 16, color: 'white' }}
              >
                Create New Group
              </Button>
            </View>
          )}
        </ScrollView>
      )}
    </SurfaceLayout>
  );
}
