import React, {useContext, useState} from 'react';
import {Image, Pressable, ScrollView, Text, View, StyleSheet} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import {useFocusEffect} from '@react-navigation/native';
import {TopBarContext} from '../navigations/tabNavigation';
import {GetAllStatus} from '../src/controllers/status';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MyContext} from '../App';
import {FAB} from 'react-native-paper';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import Loader from '../src/components/Loader';

export default function Status(props) {
  const {setactiveTab, setopenMenu} = useContext(TopBarContext);
  const {jersAppTheme, Data} = useContext(MyContext);
  const [status, setstatus] = useState([]);
  const [userData, setuserData] = useState(null);
  const [isLoading, setisLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setactiveTab('STATUS');
      GetAllStatus(Data?._id).then(data => {
        setstatus(data);
        setisLoading(false);
      });
      AsyncStorage.getItem('userData').then(data => {
        setuserData(data ? JSON.parse(data) : null);
      });
    }, [Data]),
  );

  const handlePress = () => {
    setopenMenu(false);
  };

  const userStatus = status?.find(data => data.userID == userData?._id);
  const otherUserStatus = status?.filter(data => data.userID !== userData?._id);

  const styles = StyleSheet.create({
    sectionHeader: {
      color: jersAppTheme.subText,
      fontSize: 14,
      fontWeight: '600',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    listContainer: {
      backgroundColor: jersAppTheme.main,
    },
    separator: {
      height: 1,
      backgroundColor: jersAppTheme.appBar, // very subtle line
      marginLeft: 80, // Align with text content
    },
    fabCamera: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 16,
      backgroundColor: jersAppTheme.badgeColor,
      borderRadius: 16,
    },
    fabPencil: {
      position: 'absolute',
      margin: 16,
      right: 8,
      bottom: 85,
      backgroundColor: jersAppTheme.appBar,
      borderRadius: 12,
    },
  });

  return (
    <SurfaceLayout title="Status">
      {isLoading ? (
        <Loader />
      ) : (
        <View style={{flex: 1, backgroundColor: jersAppTheme.main}}>
          <Pressable style={{flex: 1}} onPress={handlePress}>
            <ScrollView>
              {/* My Status Section */}
              <View style={styles.listContainer}>
                <MyComponent
                  status={{
                    title: 'My status',
                    file: userStatus?.file,
                    id: userData?._id,
                    emptySubtitle: 'Tap to add status update',
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
                  onRightIconPress={() => {
                    if (userStatus) {
                      props.navigation.navigate('MyStatuses', {
                        statusId: userStatus._id,
                        initialFiles: userStatus.file,
                      });
                    }
                  }}
                />
              </View>

              {/* Recent Updates Section */}
              {otherUserStatus && otherUserStatus.length > 0 && (
                <>
                  <Text style={styles.sectionHeader}>Recent updates</Text>
                  
                  <View style={styles.listContainer}>
                    {otherUserStatus?.map((elem, index) => {
                      return (
                        <View key={elem._id}>
                          <MyComponent
                            status={{...elem, id: userData?._id}}
                            onclick={() => {
                              props.navigation.navigate('PlayStatus', {
                                id: elem._id,
                              });
                            }}
                          />
                          {index !== otherUserStatus.length - 1 && (
                            <View style={styles.separator} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                </>
              )}
              <View style={{height: 120}} />
            </ScrollView>
          </Pressable>

          {/* Floating Action Buttons */}
          <FAB
            icon="pencil"
            color={jersAppTheme.title}
            style={styles.fabPencil}
            size="small"
            onPress={() => {
              props.navigation.navigate('AddTextStatus', {
                id: userData?._id,
              });
            }}
          />
          <FAB
            icon="camera"
            color="white"
            style={styles.fabCamera}
            onPress={() => {
              props.navigation.navigate('AddStatus', {
                id: userData?._id,
              });
            }}
          />
        </View>
      )}
    </SurfaceLayout>
  );
}
