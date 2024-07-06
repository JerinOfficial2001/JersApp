import {View, Text, StyleSheet} from 'react-native';
import React, {useContext} from 'react';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import Loader from '../src/components/Loader';
import {useQuery} from '@tanstack/react-query';
import {FlatList} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import {MyContext} from '../App';
import {GetMembers} from '../src/controllers/members';
import {Button} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function ViewGroupProfile({route}) {
  const {id, image, name, members} = route.params;
  const {jersAppTheme, Data} = useContext(MyContext);
  const {
    data: allMembers,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['DBcontacts'],
    queryFn: () =>
      GetMembers({token: Data.accessToken, id: Data._id, groupID: id}),
    enabled: !!Data && !!Data._id,
  });
  const styles = StyleSheet.create({
    list: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 5,
    },
    item: {
      elevation: 2,
    },
  });
  return (
    <SurfaceLayout group={{name, image, members}}>
      {isLoading ? (
        <Loader />
      ) : allMembers?.length > 0 ? (
        <FlatList
          data={[
            {
              _id: 0,
              name: 'Add members',
              customImg: (
                <EntypoIcon
                  color={jersAppTheme.headerText}
                  size={23}
                  name="add-user"
                />
              ),
            },
            ...allMembers,
          ]}
          renderItem={({item}) => (
            <MyComponent
              // onclick={() => {
              //   toggleSelection(item._id);
              // }}
              customImg={item.customImg}
              contactPg
              contact={item}
            />
          )}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            height: 600,
          }}>
          <Text style={{color: 'gray'}}>Something went wrong</Text>
        </View>
      )}
      <View style={{padding: 10}}>
        <Button
          mode="outlined"
          textColor="red"
          style={{width: '100%', borderColor: 'red'}}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              width: '100%',
              flex: 1,
              gap: 5,
            }}>
            <MaterialIcons name="logout" color="red" size={20} />
            <Text style={{color: 'red', fontSize: 18}}>Exit group</Text>
          </View>
        </Button>
      </View>
    </SurfaceLayout>
  );
}
