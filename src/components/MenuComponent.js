import {
  View,
  Text,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Button, Menu} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIconsIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcons from 'react-native-vector-icons/Entypo';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import {MyContext} from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSocketHook} from '../../utils/socket';

export default function MenuComponent({
  openMenu,
  handleCloseMenu,
  handleOpen,
  isDelete,
  setopenMenu,
}) {
  const {Data, jersAppTheme} = useContext(MyContext);
  const {socketLogout} = useSocketHook();
  const navigation = useNavigation();
  const styles = StyleSheet.create({
    icon: {
      color: 'white',
    },
    menuIcons: {
      color: jersAppTheme.themeText,
    },
  });
  const [isloading, setisloading] = useState(false);

  const logout = () => {
    setisloading(true);
    socketLogout(Data?._id);
    AsyncStorage.removeItem('userData');
    navigation.navigate('Login');
    handleCloseMenu();
    ToastAndroid.show('Logged out successfully', ToastAndroid.SHORT);
    setisloading(false);
  };
  const MenuButton = () => (
    <TouchableOpacity onPress={() => setopenMenu(true)}>
      {isDelete ? (
        <EntypoIcons style={styles.icon} name="trash" size={24} />
      ) : (
        <EntypoIcons style={styles.icon} name="dots-three-vertical" size={24} />
      )}
    </TouchableOpacity>
  );
  return (
    <Menu
      contentStyle={{backgroundColor: jersAppTheme.model}}
      visible={openMenu}
      onDismiss={() => setopenMenu(false)}
      anchor={<MenuButton />}>
      <Menu.Item
        leadingIcon={() => (
          <EntypoIcons style={styles.menuIcons} name="user" size={24} />
        )}
        title={Data?.name}
        titleStyle={{color: jersAppTheme.title}}
        onPress={() => {
          handleCloseMenu();
          navigation.navigate('MyProfile', {
            id: Data?._id,
          });
        }}
      />
      <Menu.Item
        leadingIcon={() => (
          <MaterialCommunityIconsIcons
            style={styles.menuIcons}
            name="qrcode-scan"
            size={24}
          />
        )}
        title="JersApp web"
        titleStyle={{color: jersAppTheme.title}}
        onPress={() => {
          handleCloseMenu();
          navigation.navigate('QRScanner');
        }}
      />
      <Menu.Item
        leadingIcon={() => (
          <MaterialCommunityIconsIcons
            style={styles.menuIcons}
            name="theme-light-dark"
            size={26}
          />
        )}
        title="Theme"
        titleStyle={{color: jersAppTheme.title}}
        onPress={() => {
          handleCloseMenu();
          navigation.navigate('Themes', {id: Data?._id});
        }}
      />
      <Menu.Item
        leadingIcon={() => (
          <View>
            {isloading ? (
              <ActivityIndicator animating={true} color={jersAppTheme.appBar} />
            ) : (
              <AntDesignIcons
                style={styles.menuIcons}
                name="logout"
                size={24}
              />
            )}
          </View>
        )}
        title="Logout"
        titleStyle={{color: jersAppTheme.title}}
        onPress={logout}
      />
    </Menu>
  );
}
