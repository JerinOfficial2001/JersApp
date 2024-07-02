import React, {useContext, useState} from 'react';
import {Image, Pressable, ScrollView, Text, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import {useFocusEffect} from '@react-navigation/native';
import {TopBarContext} from '../navigations/tabNavigation';
import {GetAllStatus} from '../src/controllers/status';
import StatusIndicator from '../src/components/StatusIndicator';
import DonutChart from '../src/components/DonutChart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DarkThemeSchema, JersAppThemeSchema} from '../utils/theme';
import {MyContext} from '../App';
import {ActivityIndicator, MD2Colors} from 'react-native-paper';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';

export default function Status(props) {
  // const [theme, settheme] = useState(JersAppThemeSchema);

  const {setactiveTab, addStatus, setaddStatus, setopenMenu} =
    useContext(TopBarContext);
  const {jersAppTheme} = useContext(MyContext);
  const [status, setstatus] = useState([]);
  const [userData, setuserData] = useState(null);
  const [isLoading, setisLoading] = useState(true);
  useFocusEffect(
    React.useCallback(() => {
      setactiveTab('STATUS');
      GetAllStatus().then(data => {
        setstatus(data);
        setisLoading(false);
      });
      AsyncStorage.getItem('userData').then(data => {
        setuserData(data ? JSON.parse(data) : null);
      });
    }, []),
  );
  const handlePress = () => {
    setopenMenu(false);
  };
  const userStatus = status?.find(data => data.userID == userData?._id);
  const otherUserStatus = status?.filter(data => data.userID !== userData?._id);
  return (
    <SurfaceLayout title="Status">
      <Pressable style={{flex: 1}} onPress={handlePress}>
        {isLoading ? (
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center',
            }}>
            <ActivityIndicator
              animating={true}
              color={MD2Colors.green400}
              size="large"
            />
          </View>
        ) : (
          <ScrollView style={{padding: 10}}>
            <MyComponent
              status={{
                title: 'My status',
                file: userStatus?.file,
                id: userData?._id,
              }}
              onclick={() => {
                if (!userStatus) {
                  props.navigation.navigate('AddStatus', {
                    id: userData?._id,
                  });
                } else {
                  props.navigation.navigate('PlayStatus', {
                    id: userStatus?._id,
                  });
                }
              }}
            />
            {otherUserStatus?.map(elem => {
              return (
                <MyComponent
                  status={{...elem, id: userData?._id}}
                  key={elem._id}
                  onclick={() => {
                    props.navigation.navigate('PlayStatus', {
                      id: elem._id,
                    });
                  }}
                />
              );
            })}
          </ScrollView>
        )}
      </Pressable>
    </SurfaceLayout>
  );
}
