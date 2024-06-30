import {
  Image,
  TouchableOpacity,
  View,
  Text,
  ToastAndroid,
  StyleSheet,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import AuthModal from '../src/components/AuthModal';
import Chats from '../screens/Chats';
import Status from '../screens/Status';
import TopBar from '../src/components/TopBar';
import {
  ActivityIndicator,
  Avatar,
  IconButton,
  MD2Colors,
  Menu,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GetUsersByID, logoutWithToken} from '../src/controllers/auth';
import {DarkThemeSchema, JersAppThemeSchema} from '../utils/theme';
import Plus from '../src/assets/svg/plus';
import Camera from '../src/assets/svg/camera';
import {MyContext} from '../App';
import {TopBarContext} from './tabNavigation';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcons from 'react-native-vector-icons/FontAwesome';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import {Path, Svg} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Lottie from 'lottie-react-native';
import {useSocketHook} from '../utils/socket';
import AddStatus from '../screens/AddStatus';
import AllContacts from '../screens/AllContacts';

const Tab = createBottomTabNavigator();
const AnimatedSvg = Animated.createAnimatedComponent(Svg);
interface UserData {
  _id: string;
  name?: string;
  // Add other fields as necessary
}
export default function BottomTabNavigator(props: any) {
  const {socketLogout} = useSocketHook();
  const [visible, setVisible] = useState(false);
  const [isDelete, setisDelete] = useState(false);
  const [isModelOpen, setisModelOpen] = useState(false);
  const [openMenu, setopenMenu] = useState(false);
  const [isloading, setisloading] = useState(false);
  const [userData, setuserData] = useState({});
  const [activeTab, setactiveTab] = useState('CHATS');
  const [addStatus, setaddStatus] = useState(false);
  const [userProfile, setuserProfile] = useState(null);
  const [jersAppTheme, setjersApptheme] = useState(JersAppThemeSchema);
  // const {jersAppTheme, setpageName} = useContext(MyContext);
  // useEffect(() => {
  //   AsyncStorage.getItem('userData').then(res => {
  //     const data = JSON.parse(res);
  //     setuserData(data);
  //     GetUsersByID(data._id).then(res => {
  //       setuserProfile(res?.image?.url);
  //     });
  //   });
  //   setpageName('Home');
  // }, []);
  // const renderRightHeaderComponent = () => (
  //   <IconButton
  //     style={{
  //       bottom: 10,
  //       position: 'absolute',
  //       right: 10,
  //       backgroundColor: jersAppTheme.appBar,
  //       padding: 10,
  //     }}
  //     icon={() => (
  //       <View>
  //         {activeTab == 'CHATS' ? (
  //           <Plus color={jersAppTheme.title} />
  //         ) : (
  //           <Camera color={jersAppTheme.title} />
  //         )}
  //       </View>
  //     )}
  //     size={40}
  //     onPress={() => {
  //       activeTab == 'CHATS'
  //         ? props.navigation.navigate('AllContacts')
  //         : props.navigation.navigate('AddStatus', {
  //             onlyCamera: false,
  //             id: userData._id,
  //           });
  //     }}
  //   />
  // );
  const handleCloseMenu = () => {
    setopenMenu(false);
  };
  const logout = () => {
    setisloading(true);
    AsyncStorage.getItem('token').then(data => {
      const parsedToken = data ? JSON.parse(data) : false;
      if (parsedToken) {
        logoutWithToken(parsedToken).then(res => {
          if (res.status == 'ok') {
            // socketLogout(userData._id);
            AsyncStorage.removeItem('userData');
            props.navigation.navigate('Login');
            handleCloseMenu();
            ToastAndroid.show(res.message, ToastAndroid.SHORT);
          }
          setisloading(false);
        });
      } else {
        ToastAndroid.show('Logout Failed', ToastAndroid.SHORT);
        setisloading(false);
      }
    });
  };
  return (
    <TopBarContext.Provider
      value={{
        setopenMenu,
        setisDelete,
        isModelOpen,
        setisModelOpen,
        setactiveTab,
        addStatus,
        setaddStatus,
      }}>
      <View style={{height: '100%'}}>
        <TopBar
          title={'JersApp'}
          rightOnPress={() => {
            if (isDelete) {
              setisModelOpen(true);
            } else {
              // props.navigation.navigate('Settings');
              setopenMenu(true);
            }
          }}
          isDelete={isDelete}
        />
        <View
          style={{
            display: openMenu ? 'flex' : 'none',
            position: 'absolute',
            right: 5,
            top: 40,
            zIndex: 2,
            backgroundColor: JersAppThemeSchema.model,
            borderRadius: 10,
            shadowColor: JersAppThemeSchema.shadows,
            shadowOpacity: 10,
          }}>
          <Menu.Item
            leadingIcon={() =>
              userProfile ? (
                <Avatar.Image size={30} source={{uri: userProfile}} />
              ) : (
                <Avatar.Image
                  size={30}
                  source={require('../src/assets/user.png')}
                />
              )
            }
            title={'jerin'}
            titleStyle={{color: JersAppThemeSchema.title}}
            onPress={() => {
              handleCloseMenu();
              props.navigation.navigate('MyProfile', {
                // id: userData._id,
              });
            }}
          />
          <Menu.Item
            leadingIcon={() => (
              <Image
                style={{
                  height: 30,
                  width: 30,
                }}
                source={require('../src/assets/qrscan.png')}
              />
            )}
            title="JersApp web"
            titleStyle={{color: JersAppThemeSchema.title}}
            onPress={() => {
              handleCloseMenu();
              props.navigation.navigate('QRScanner');
            }}
          />
          <Menu.Item
            leadingIcon={() => (
              <Image
                style={{
                  height: 30,
                  width: 30,
                }}
                source={require('../src/assets/logo.png')}
              />
            )}
            title="Theme"
            titleStyle={{color: JersAppThemeSchema.title}}
            onPress={() => {
              handleCloseMenu();
              props.navigation.navigate('Themes');
            }}
          />
          <Menu.Item
            leadingIcon={() => (
              <View>
                {isloading ? (
                  <ActivityIndicator
                    animating={true}
                    color={JersAppThemeSchema.appBar}
                  />
                ) : (
                  <Image
                    style={{
                      height: 30,
                      width: 30,
                    }}
                    source={require('../src/assets/logout.png')}
                  />
                )}
              </View>
            )}
            title="Logout"
            titleStyle={{color: JersAppThemeSchema.title}}
            onPress={logout}
          />
        </View>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: 'red',
            },
          }}
          tabBar={props => <AnimatedTabBar {...props} />}>
          <Tab.Screen
            options={{
              headerShown: false,

              // @ts-ignore
              // tabBarIcon: ({ref}) => (
              //   <Lottie
              //     ref={ref}
              //     loop={false}
              //     source={require('../src/assets/Jsons/chat.icon.json')}
              //     style={styles.icon}
              //   />
              // ),
              tabBarIcon: () => (
                <MaterialCommunityIcons
                  style={styles.icon}
                  name="chatbox"
                  size={26}
                />
              ),
            }}
            component={Chats}
            name="Chats"
          />
          <Tab.Screen
            options={{
              headerShown: false,

              tabBarIcon: () => (
                <MaterialCommunityIcons
                  style={styles.icon}
                  name="heart-circle-outline"
                  size={38}
                />
              ),
            }}
            component={Status}
            name="Status"
          />
          <Tab.Screen
            options={{
              headerShown: false,

              // @ts-ignore
              // tabBarIcon: ({ref}) => (
              //   <Lottie
              //     ref={ref}
              //     loop={false}
              //     source={require('../src/assets/Jsons/home.icon.json')}
              //     style={styles.icon}
              //   />
              // ),
              tabBarIcon: () => (
                <FontAwesomeIcons style={styles.icon} name="group" size={26} />
              ),
            }}
            component={Status}
            // props={props}
            name="Group"
          />
          <Tab.Screen
            options={{
              headerShown: false,

              tabBarIcon: () => (
                <MaterialCommunityIcons
                  style={styles.icon}
                  name="person-circle"
                  size={35}
                />
              ),
            }}
            component={AllContacts}
            name="AllContacts"
          />
        </Tab.Navigator>
      </View>

      <AuthModal visible={visible} setVisible={setVisible} />
      {/* {renderRightHeaderComponent()} */}
    </TopBarContext.Provider>
  );
}

// ------------------------------------------------------------------

// ------------------------------------------------------------------

const AnimatedTabBar = ({
  state: {index: activeIndex, routes},
  navigation,
  descriptors,
}: BottomTabBarProps) => {
  const {bottom} = useSafeAreaInsets();

  // get information about the components position on the screen -----

  const reducer = (state: any, action: {x: number; index: number}) => {
    // Add the new value to the state
    return [...state, {x: action.x, index: action.index}];
  };

  const [layout, dispatch] = useReducer(reducer, []);
  // console.log(layout);

  const handleLayout = (event: LayoutChangeEvent, index: number) => {
    dispatch({x: event.nativeEvent.layout.x, index});
  };

  // animations ------------------------------------------------------

  const xOffset = useDerivedValue(() => {
    // Our code hasn't finished rendering yet, so we can't use the layout values
    if (layout.length !== routes.length) return 0;
    // We can use the layout values
    // Copy layout to avoid errors between different threads
    // We subtract 25 so the active background is centered behind our TabBar Components
    // 20 pixels is the width of the left part of the svg (the quarter circle outwards)
    // 5 pixels come from the little gap between the active background and the circle of the TabBar Components
    return [...layout].find(({index}) => index === activeIndex)!.x - 25;
    // Calculate the offset new if the activeIndex changes (e.g. when a new tab is selected)
    // or the layout changes (e.g. when the components haven't finished rendering yet)
  }, [activeIndex, layout]);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      // translateX to the calculated offset with a smooth transition
      transform: [{translateX: withTiming(xOffset.value, {duration: 250})}],
    };
  });

  return (
    <View style={[styles.tabBar, {paddingBottom: bottom}]}>
      <AnimatedSvg
        width={110}
        height={60}
        viewBox="0 0 110 60"
        style={[styles.activeBackground, animatedStyles]}>
        <Path
          fill="#242C3B"
          d="M20 0H0c11.046 0 20 8.953 20 20v5c0 19.33 15.67 35 35 35s35-15.67 35-35v-5c0-11.045 8.954-20 20-20H20z"
        />
      </AnimatedSvg>

      <View style={styles.tabBarContainer}>
        {routes.map((route, index) => {
          const active = index === activeIndex;
          const {options} = descriptors[route.key];

          return (
            <TabBarComponent
              key={route.key}
              active={active}
              options={options}
              onLayout={e => handleLayout(e, index)}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        })}
      </View>
    </View>
  );
};

// ------------------------------------------------------------------

type TabBarComponentProps = {
  active?: boolean;
  options: BottomTabNavigationOptions;
  onLayout: (e: LayoutChangeEvent) => void;
  onPress: () => void;
};

const TabBarComponent = ({
  active,
  options,
  onLayout,
  onPress,
}: TabBarComponentProps) => {
  // handle lottie animation -----------------------------------------
  const ref = useRef(null);

  useEffect(() => {
    if (active && ref?.current) {
      // @ts-ignore
      ref.current.play();
    }
  }, [active]);

  // animations ------------------------------------------------------

  const animatedComponentCircleStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(active ? 1 : 0, {duration: 250}),
        },
      ],
    };
  });

  const animatedIconContainerStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(active ? 1 : 0.5, {duration: 250}),
    };
  });

  return (
    <Pressable onPress={onPress} onLayout={onLayout} style={styles.component}>
      <Animated.View
        style={[styles.componentCircle, animatedComponentCircleStyles]}
      />
      <Animated.View
        style={[styles.iconContainer, animatedIconContainerStyles]}>
        {/* @ts-ignore */}
        {options.tabBarIcon ? options.tabBarIcon({ref}) : <Text>?</Text>}
      </Animated.View>
    </Pressable>
  );
};
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#151B26',
  },
  activeBackground: {
    position: 'absolute',
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },
  component: {
    height: 60,
    width: 60,
    marginTop: -5,
  },
  componentCircle: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: '#151B26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: 'white',
  },
});
