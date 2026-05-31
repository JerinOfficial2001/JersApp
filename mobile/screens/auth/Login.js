import React, {useEffect, useRef, useState, useContext} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import {ActivityIndicator, TextInput} from 'react-native-paper';
import {login} from '../../src/controllers/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {MyContext} from '../../App';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Login(props) {
  const {setuserData, jersAppTheme} = useContext(MyContext);

  // ✅ Fixed: use useRef so Animated.Value is not recreated on every render
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkToken();
    }, []),
  );

  const checkToken = async () => {
    const token = await AsyncStorage.getItem('userData');
    const userData = token ? JSON.parse(token) : false;
    if (userData) {
      props.navigation.navigate('Home', {userID: userData._id});
    }
  };

  const [formData, setformData] = useState({mobNum: '', password: ''});
  const [isHide, setisHide] = useState(true);
  const [mobNubErr, setmobNubErr] = useState(false);
  const [passwordErr, setpasswordErr] = useState(false);
  const [errMsg, seterrMsg] = useState({});
  const [isLoading, setisLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = () => {
    if (
      !mobNubErr &&
      !passwordErr &&
      formData.mobNum !== '' &&
      formData.password !== ''
    ) {
      setisLoading(true);
      AsyncStorage.removeItem('token');
      login(formData.mobNum, formData.password, props).then(data => {
        setisLoading(false);
        if (data?.status === 'ok' && data?.data) {
          setuserData(data.data);
          props.navigation.navigate('Home');
        }
      });
    } else {
      handleValidation('mobNum', formData.mobNum);
      handleValidation('password', formData.password);
    }
  };

  const handleValidation = (name, value) => {
    if (name === 'mobNum') {
      if (!value) {
        setmobNubErr(true);
        seterrMsg(prev => ({...prev, mobNum: 'Phone number is required'}));
      } else if (value.length !== 10) {
        setmobNubErr(true);
        seterrMsg(prev => ({...prev, mobNum: 'Must be exactly 10 digits'}));
      } else {
        setmobNubErr(false);
      }
    } else if (name === 'password') {
      if (!value) {
        setpasswordErr(true);
        seterrMsg(prev => ({...prev, password: 'Password is required'}));
      } else if (value.length < 6) {
        setpasswordErr(true);
        seterrMsg(prev => ({
          ...prev,
          password: 'Password must be at least 6 characters',
        }));
      } else {
        setpasswordErr(false);
      }
    }
  };

  const handleOnchange = (name, value) => {
    handleValidation(name, value);
    setformData({...formData, [name]: value});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <StatusBar barStyle="light-content" backgroundColor={jersAppTheme.appBar} />
      <View style={[styles.container, {backgroundColor: jersAppTheme.appBar}]}>
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <Animated.View style={[styles.logoContainer, {transform: [{scale: logoScale}]}]}>
            <View
              style={[
                styles.logoCircle,
                {backgroundColor: jersAppTheme.badgeColor},
              ]}>
              <MaterialCommunityIcons
                name="chat-processing"
                size={40}
                color="white"
              />
            </View>
            {/* Glow ring */}
            <View
              style={[
                styles.logoGlow,
                {borderColor: jersAppTheme.badgeColor + '40'},
              ]}
            />
          </Animated.View>
          <Text style={[styles.appName, {color: 'white'}]}>JersApp</Text>
          <Text style={[styles.tagline, {color: jersAppTheme.placeholderColor}]}>
            Connect with your world
          </Text>
        </Animated.View>

        {/* Form Card */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: jersAppTheme.main,
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <Text style={[styles.formTitle, {color: jersAppTheme.themeText}]}>
            Welcome back 👋
          </Text>
          <Text style={[styles.formSubtitle, {color: jersAppTheme.placeholderColor}]}>
            Sign in to continue
          </Text>

          {/* Phone Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              value={formData.mobNum}
              onChangeText={value => handleOnchange('mobNum', value)}
              onFocus={() => setFocused('mobNum')}
              onBlur={() => setFocused('')}
              style={[
                styles.input,
                {backgroundColor: jersAppTheme.model || '#2D3544'},
              ]}
              underlineColor="transparent"
              activeUnderlineColor={jersAppTheme.badgeColor}
              placeholder="Phone number"
              placeholderTextColor={jersAppTheme.placeholderColor}
              keyboardType="numeric"
              maxLength={10}
              textColor={jersAppTheme.themeText}
              error={mobNubErr}
              left={
                <TextInput.Icon
                  icon={() => (
                    <MaterialCommunityIcons
                      name="phone"
                      size={22}
                      color={
                        focused === 'mobNum'
                          ? jersAppTheme.badgeColor
                          : jersAppTheme.placeholderColor
                      }
                    />
                  )}
                />
              }
            />
            {mobNubErr && (
              <Text style={styles.errorText}>{errMsg.mobNum}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              error={passwordErr}
              secureTextEntry={isHide}
              value={formData.password}
              onChangeText={value => handleOnchange('password', value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              style={[
                styles.input,
                {backgroundColor: jersAppTheme.model || '#2D3544'},
              ]}
              underlineColor="transparent"
              activeUnderlineColor={jersAppTheme.badgeColor}
              placeholder="Password"
              placeholderTextColor={jersAppTheme.placeholderColor}
              textColor={jersAppTheme.themeText}
              left={
                <TextInput.Icon
                  icon={() => (
                    <MaterialCommunityIcons
                      name="lock"
                      size={22}
                      color={
                        focused === 'password'
                          ? jersAppTheme.badgeColor
                          : jersAppTheme.placeholderColor
                      }
                    />
                  )}
                />
              }
              right={
                <TextInput.Icon
                  icon={() => (
                    <TouchableOpacity onPress={() => setisHide(!isHide)}>
                      <EntypoIcon
                        name={isHide ? 'eye' : 'eye-with-line'}
                        size={22}
                        color={jersAppTheme.placeholderColor}
                      />
                    </TouchableOpacity>
                  )}
                />
              }
            />
            {passwordErr && (
              <Text style={styles.errorText}>{errMsg.password}</Text>
            )}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isLoading}
            style={[
              styles.loginButton,
              {
                backgroundColor: jersAppTheme.badgeColor,
                opacity: isLoading ? 0.7 : 1,
              },
            ]}>
            {isLoading ? (
              <ActivityIndicator animating={true} color="white" size={22} />
            ) : (
              <>
                <MaterialCommunityIcons name="login" size={20} color="white" />
                <Text style={styles.loginButtonText}>Sign In</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[
                styles.dividerLine,
                {backgroundColor: jersAppTheme.placeholderColor + '40'},
              ]}
            />
            <Text style={[styles.dividerText, {color: jersAppTheme.placeholderColor}]}>
              New here?
            </Text>
            <View
              style={[
                styles.dividerLine,
                {backgroundColor: jersAppTheme.placeholderColor + '40'},
              ]}
            />
          </View>

          <View style={[styles.hintBox, {backgroundColor: jersAppTheme.badgeColor + '15', borderColor: jersAppTheme.badgeColor + '30'}]}>
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color={jersAppTheme.badgeColor}
            />
            <Text style={[styles.registerHint, {color: jersAppTheme.placeholderColor}]}>
              Enter your number — if not registered, you'll be redirected to sign up.
            </Text>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    marginBottom: 4,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#439BCC',
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '400',
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    gap: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  formSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    fontSize: 15,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 11,
    marginTop: 3,
    marginLeft: 4,
  },
  loginButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    elevation: 6,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    flexDirection: 'row',
    gap: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  registerHint: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});
