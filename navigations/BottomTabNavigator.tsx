import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import React, {
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GetUsersByID} from '../src/controllers/auth';
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
import AllContacts from '../screens/AllContacts';
import {useSocketHook} from '../utils/socket';
import {StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import Groups from '../screens/Groups';
import MenuComponent from '../src/components/MenuComponent';

const Tab = createBottomTabNavigator();
const AnimatedSvg = Animated.createAnimatedComponent(Svg);
interface UserData {
  _id: string;
  name?: string;
  // Add other fields as necessary
}

export default function BottomTabNavigator() {
  const navigation = useNavigation<any>();
  const {socketLogout}: any = useSocketHook();
  const [visible, setVisible] = useState(false);
  const [isDelete, setisDelete] = useState(false);
  const [isModelOpen, setisModelOpen] = useState(false);
  const [openMenu, setopenMenu] = useState(false);
  const [userData, setuserData] = useState<UserData | null>(null);
  const [activeTab, setactiveTab] = useState('CHATS');
  const [addStatus, setaddStatus] = useState(false);
  const [userProfile, setuserProfile] = useState(null);
  // const [jersAppTheme, setjersApptheme] = useState(jersAppTheme);
  const {jersAppTheme, setpageName} = useContext<any>(MyContext);
  useEffect(() => {
    AsyncStorage.getItem('userData').then((res: any) => {
      const data = res ? JSON.parse(res) : false;
      if (data) {
        setuserData(data);
        GetUsersByID(data?._id).then(res => {
          setuserProfile(res?.image?.url);
        });
      }
    });
    setpageName('Home');
  }, [openMenu]);

  const handleCloseMenu = () => {
    setopenMenu(false);
  };

  const styles = StyleSheet.create({
    icon: {
      color: 'white',
    },
    menuIcons: {
      color: jersAppTheme.themeText,
    },
  });
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
      <View style={{flex: 1}}>
        <TopBar
          title={'JersApp'}
          rightOnPress={() => {
            if (isDelete) {
              setisModelOpen(true);
            } else {
              // navigation.navigate('Settings');
              setopenMenu(true);
            }
          }}
          isDelete={isDelete}
          MenuComponent={
            <MenuComponent
              openMenu={openMenu}
              handleCloseMenu={handleCloseMenu}
              handleOpen={() => setopenMenu(true)}
              isDelete={false}
              setopenMenu={setopenMenu}
            />
          }
        />

        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: 'transparent',
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
            component={Groups}
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

//* ------------------------------------------------------------------

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
  const {jersAppTheme, setpageName} = useContext<any>(MyContext);
  const styles = StyleSheet.create({
    tabBar: {
      backgroundColor: jersAppTheme.appBar,
    },
    activeBackground: {
      position: 'absolute',
    },
    tabBarContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginBottom: 11,
    },
  });
  return (
    <View style={[styles.tabBar, {paddingBottom: bottom}]}>
      <AnimatedSvg
        width={110}
        height={60}
        viewBox="0 0 110 60"
        style={[styles.activeBackground, animatedStyles]}>
        <Path
          fill={jersAppTheme.main}
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
  const {jersAppTheme, setpageName} = useContext<any>(MyContext);

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

  const styles = StyleSheet.create({
    component: {
      height: 60,
      width: 60,
      marginTop: -5,
    },
    componentCircle: {
      flex: 1,
      borderRadius: 30,
      backgroundColor: jersAppTheme.appBar,
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
