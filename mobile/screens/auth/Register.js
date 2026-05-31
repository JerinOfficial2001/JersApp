import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import {ActivityIndicator, Avatar, TextInput} from 'react-native-paper';
import {login, register} from '../../src/controllers/auth';
import DocumentPicker from 'react-native-document-picker';
import {MyContext} from '../../App';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Register({route, ...props}) {
  const {jersAppTheme, setuserData} = useContext(MyContext);
  const {mobNum, password} = route.params;

  // ✅ Fixed: use useRef so Animated.Value is not recreated on every render
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [formData, setformData] = useState({
    mobNum: mobNum || '',
    password: password || '',
    name: '',
    image: null,
  });
  const [isLoading, setisLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 600, useNativeDriver: true}),
      Animated.timing(slideAnim, {toValue: 0, duration: 600, useNativeDriver: true}),
    ]).start();
  }, []);

  const handleFormData = (key, value) => {
    setformData(prev => ({...prev, [key]: value}));
  };

  const handlePick = async () => {
    try {
      if (formData.image == null) {
        const result = await DocumentPicker.pick({
          mode: 'open',
          presentationStyle: 'fullScreen',
          type: [DocumentPicker.types.images],
        });
        handleFormData('image', result[0]);
      } else {
        handleFormData('image', null);
      }
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        ToastAndroid.show('Failed to pick image', ToastAndroid.SHORT);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setisLoading(true);
    try {
      const convertToMultipart = new FormData();
      convertToMultipart.append('mobNum', formData.mobNum);
      convertToMultipart.append('password', formData.password);
      convertToMultipart.append('name', formData.name.trim());
      if (formData.image) {
        convertToMultipart.append('image', {
          uri: formData.image.uri,
          type: formData.image.type || 'image/jpeg',
          name: formData.image.name || 'profile.jpg',
        });
      }

      const data = await register(formData, convertToMultipart);
      if (data && data.status === 'ok') {
        ToastAndroid.show('Registered Successfully!', ToastAndroid.SHORT);
        // Login after registration to get full session
        const loginData = await login(formData.mobNum, formData.password, props);
        setisLoading(false);
        if (loginData?.status === 'ok' && loginData?.data) {
          setuserData(loginData.data);
          props.navigation.navigate('Home');
        } else {
          // Fallback: store registered user and go Home
          setuserData(data.data);
          props.navigation.navigate('Home');
        }
      } else {
        ToastAndroid.show(data?.message || 'Registration failed', ToastAndroid.SHORT);
        setisLoading(false);
      }
    } catch (e) {
      console.error('Register handleSubmit err:', e);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
      setisLoading(false);
    }
  };

  const handleOnchange = (name, value) => {
    setformData(prev => ({...prev, [name]: value}));
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: null}));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <StatusBar barStyle="light-content" backgroundColor={jersAppTheme.appBar} />
      <ScrollView
        contentContainerStyle={[styles.container, {backgroundColor: jersAppTheme.appBar}]}
        keyboardShouldPersistTaps="handled">
        <Animated.View
          style={[
            styles.header,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={[styles.logoCircle, {backgroundColor: jersAppTheme.badgeColor + '20', borderColor: jersAppTheme.badgeColor + '50'}]}>
            <MaterialCommunityIcons
              name="chat-processing"
              size={36}
              color={jersAppTheme.badgeColor}
            />
          </View>
          <Text style={[styles.title, {color: 'white'}]}>Create Account</Text>
          <Text style={[styles.subtitle, {color: jersAppTheme.placeholderColor}]}>
            Set up your JersApp profile
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: jersAppTheme.main,
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>

          {/* Avatar Picker */}
          <TouchableOpacity
            onPress={handlePick}
            style={styles.avatarContainer}
            activeOpacity={0.8}>
            <View style={[styles.avatarRing, {borderColor: jersAppTheme.badgeColor}]}>
              <Avatar.Image
                size={90}
                source={
                  formData.image != null
                    ? {uri: formData.image.uri || formData.image}
                    : require('../../src/assets/user.png')
                }
              />
            </View>
            <View style={[styles.cameraBtn, {backgroundColor: jersAppTheme.badgeColor}]}>
              <MaterialCommunityIcons
                name={formData.image ? 'close' : 'camera'}
                size={16}
                color="white"
              />
            </View>
            <Text style={[styles.photoHint, {color: jersAppTheme.placeholderColor}]}>
              {formData.image ? 'Tap to change photo' : 'Add profile photo'}
            </Text>
          </TouchableOpacity>

          {/* Name Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              value={formData.name}
              onChangeText={value => handleOnchange('name', value)}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused('')}
              style={[styles.input, {backgroundColor: jersAppTheme.model || '#2D3544'}]}
              underlineColor="transparent"
              activeUnderlineColor={jersAppTheme.badgeColor}
              placeholder="Your name"
              placeholderTextColor={jersAppTheme.placeholderColor}
              keyboardType="default"
              textColor={jersAppTheme.themeText}
              error={!!errors.name}
              left={
                <TextInput.Icon
                  icon={() => (
                    <MaterialCommunityIcons
                      name="account"
                      size={22}
                      color={
                        focused === 'name'
                          ? jersAppTheme.badgeColor
                          : jersAppTheme.placeholderColor
                      }
                    />
                  )}
                />
              }
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

          {/* Phone (read-only) */}
          <View style={styles.inputWrapper}>
            <TextInput
              value={formData.mobNum}
              editable={false}
              style={[
                styles.input,
                {backgroundColor: jersAppTheme.model || '#2D3544', opacity: 0.6},
              ]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              placeholder="Phone number"
              placeholderTextColor={jersAppTheme.placeholderColor}
              textColor={jersAppTheme.themeText}
              left={
                <TextInput.Icon
                  icon={() => (
                    <MaterialCommunityIcons
                      name="phone-lock"
                      size={22}
                      color={jersAppTheme.placeholderColor}
                    />
                  )}
                />
              }
            />
            <Text style={[styles.fieldHint, {color: jersAppTheme.placeholderColor}]}>
              Verified phone number — cannot be changed
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isLoading}
            style={[
              styles.submitButton,
              {
                backgroundColor: jersAppTheme.badgeColor,
                opacity: isLoading ? 0.7 : 1,
              },
            ]}>
            {isLoading ? (
              <ActivityIndicator animating={true} color="white" size={22} />
            ) : (
              <>
                <MaterialCommunityIcons name="check-circle-outline" size={20} color="white" />
                <Text style={styles.submitButtonText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    gap: 20,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  avatarRing: {
    borderWidth: 3,
    borderRadius: 50,
    padding: 3,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 22,
    right: -2,
    borderRadius: 50,
    padding: 6,
    elevation: 4,
  },
  photoHint: {
    fontSize: 12,
    marginTop: 8,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 2,
  },
  input: {
    borderRadius: 12,
    fontSize: 15,
  },
  fieldHint: {
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 11,
    marginTop: 3,
    marginLeft: 4,
  },
  submitButton: {
    height: 52,
    width: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    elevation: 6,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    flexDirection: 'row',
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
