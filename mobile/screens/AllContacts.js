import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import {Avatar} from 'react-native-paper';
import {requestContactsPermission} from '../src/controllers/contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MyContext} from '../App';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {expressApi} from '../src/api';
import apiClient from '../src/services/apiClient';

export default function AllContacts(props) {
  const [contacts, setContacts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const {jersAppTheme} = useContext(MyContext);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Skeleton pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {toValue: 0.5, duration: 800, useNativeDriver: true}),
        Animated.timing(pulseAnim, {toValue: 1, duration: 800, useNativeDriver: true}),
      ]),
    );
    if (loading) pulse.start();
    else pulse.stop();
    return () => pulse.stop();
  }, [loading]);

  function cleanPhoneNumber(phoneNumber) {
    return phoneNumber?.replace(/\D/g, '').slice(-10) || '';
  }

  const getContacts = useCallback(async storedUser => {
    setLoading(true);
    try {
      const permissionsGranted = await requestContactsPermission();
      if (!permissionsGranted || permissionsGranted.length === 0) {
        ToastAndroid.show('Contacts permission denied', ToastAndroid.SHORT);
        setLoading(false);
        return;
      }

      const deviceContactList = [];
      for (const c of permissionsGranted) {
        const rawNum = c.phoneNumbers?.[0]?.number;
        if (!rawNum) continue;
        const cleaned = cleanPhoneNumber(rawNum);
        if (cleaned && cleaned.length === 10) {
          deviceContactList.push({
            givenName: c.givenName || '',
            name: c.displayName || c.givenName || '',
            mobNum: cleaned,
            user_id: storedUser._id,
          });
        }
      }

      if (deviceContactList.length === 0) {
        setContacts([]);
        setLoading(false);
        return;
      }

      // Single API call — server does the JersApp user matching
      const {data: response} = await apiClient.post(
        `/api/addAndGetAllContacts?userID=${storedUser._id}`,
        {contacts: deviceContactList},
      );

      if (response.status === 'ok') {
        const filtered = response.data.filter(c => c.user_id !== storedUser._id);
        setContacts(filtered);
      } else {
        ToastAndroid.show(response.message || 'Failed to load contacts', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      ToastAndroid.show('Failed to load contacts', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        const storedUser = storedData ? JSON.parse(storedData) : null;
        if (storedUser) {
          setUserData(storedUser);
          await getContacts(storedUser);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };
    init();
  }, []);

  const filteredContacts = useMemo(() => {
    if (!searchText.trim()) return contacts;
    const lower = searchText.toLowerCase();
    return contacts.filter(
      c =>
        c.name?.toLowerCase().includes(lower) ||
        c.given_name?.toLowerCase().includes(lower) ||
        c.phone?.toString().includes(lower),
    );
  }, [contacts, searchText]);

  // Group contacts alphabetically
  const sectioned = useMemo(() => {
    const groups = {};
    filteredContacts.forEach(c => {
      const letter = (c.name || c.given_name || '?')[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(c);
    });
    return Object.keys(groups)
      .sort()
      .map(letter => ({title: letter, data: groups[letter]}));
  }, [filteredContacts]);

  const handleClick = useCallback(
    elem => {
      if (!userData) return;
      // Navigate directly to Message with the JersApp user ID
      const receiverId = elem.isOnJersApp ? (elem.user_id || elem.ContactDetails?._id) : null;
      if (!receiverId) {
        ToastAndroid.show('User not on JersApp', ToastAndroid.SHORT);
        return;
      }
      const roomID = [userData._id, receiverId].sort().join('_');
      props.navigation.navigate('Message', {
        id: receiverId,
        userID: userData._id,
        receiverId,
        roomID,
        name: elem.name || elem.given_name || 'Message',
        image: elem.image || null,
      });
    },
    [userData, props],
  );

  const renderSectionHeader = useCallback(
    ({section}) => (
      <View style={[styles.sectionHeader, {backgroundColor: jersAppTheme.appBar + 'CC'}]}>
        <Text style={[styles.sectionHeaderText, {color: jersAppTheme.badgeColor}]}>
          {section.title}
        </Text>
      </View>
    ),
    [jersAppTheme],
  );

  const renderItem = useCallback(
    ({item, index}) => (
      <TouchableOpacity
        onPress={() => handleClick(item)}
        activeOpacity={0.7}
        style={[
          styles.contactRow,
          {borderBottomColor: jersAppTheme.placeholderColor + '15'},
        ]}>
        {item.image?.url ? (
          <Avatar.Image size={52} source={{uri: item.image.url}} />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              {backgroundColor: getAvatarColor(item.name || '?', jersAppTheme.badgeColor)},
            ]}>
            <Text style={styles.avatarInitial}>
              {(item.name || item.given_name || '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.contactInfo}>
          <Text
            style={[styles.contactName, {color: jersAppTheme.title}]}
            numberOfLines={1}>
            {item.name || item.given_name || 'Unknown'}
          </Text>
          <Text
            style={[styles.contactPhone, {color: jersAppTheme.placeholderColor}]}
            numberOfLines={1}>
            {item.phone || item.mobNum || ''}
          </Text>
        </View>
        {item.isOnJersApp ? (
          <View style={[styles.chatIconBtn, {backgroundColor: jersAppTheme.badgeColor + '15'}]}>
            <MaterialCommunityIcons
              name="chat-outline"
              size={18}
              color={jersAppTheme.badgeColor}
            />
          </View>
        ) : (
          <View style={[styles.inviteBtn, {borderColor: jersAppTheme.badgeColor + '60'}]}>
            <Text style={[styles.inviteText, {color: jersAppTheme.badgeColor}]}>Invite</Text>
          </View>
        )}
      </TouchableOpacity>
    ),
    [jersAppTheme, handleClick],
  );

  const keyExtractor = useCallback((item, index) => item._id || String(index), []);

  return (
    <SurfaceLayout title="Contacts">
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: jersAppTheme.model || '#2D3544',
            borderColor: jersAppTheme.placeholderColor + '25',
          },
        ]}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={jersAppTheme.placeholderColor}
        />
        <TextInput
          placeholder="Search contacts..."
          placeholderTextColor={jersAppTheme.placeholderColor}
          value={searchText}
          onChangeText={setSearchText}
          style={[styles.searchInput, {color: jersAppTheme.title}]}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={jersAppTheme.placeholderColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.skeletonContainer}>
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={i}
              style={[styles.skeletonRow, {opacity: pulseAnim}]}>
              <View
                style={[
                  styles.skeletonAvatar,
                  {backgroundColor: jersAppTheme.placeholderColor + '25'},
                ]}
              />
              <View style={styles.skeletonText}>
                <View
                  style={[
                    styles.skeletonLine,
                    {
                      backgroundColor: jersAppTheme.placeholderColor + '25',
                      width: `${50 + (i % 3) * 15}%`,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonLine,
                    {
                      backgroundColor: jersAppTheme.placeholderColor + '15',
                      width: '35%',
                      marginTop: 6,
                    },
                  ]}
                />
              </View>
            </Animated.View>
          ))}
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={jersAppTheme.badgeColor} />
            <Text style={[styles.loadingText, {color: jersAppTheme.placeholderColor}]}>
              Syncing contacts...
            </Text>
          </View>
        </View>
      ) : sectioned.length > 0 ? (
        <>
          <View style={styles.countRow}>
            <Text style={[styles.countText, {color: jersAppTheme.placeholderColor}]}>
              {filteredContacts.filter(c => c.isOnJersApp).length} of {filteredContacts.length} contacts on JersApp
            </Text>
            <TouchableOpacity onPress={() => getContacts(userData)}>
              <MaterialCommunityIcons
                name="refresh"
                size={18}
                color={jersAppTheme.badgeColor}
              />
            </TouchableOpacity>
          </View>
          <SectionList
            sections={sectioned}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={keyExtractor}
            contentContainerStyle={{paddingBottom: 20}}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={72}
            color={jersAppTheme.placeholderColor + '50'}
          />
          <Text style={[styles.emptyTitle, {color: jersAppTheme.title}]}>
            {searchText ? 'No results' : 'No contacts on JersApp'}
          </Text>
          <Text style={[styles.emptySubtitle, {color: jersAppTheme.placeholderColor}]}>
            {searchText
              ? 'Try a different name or number'
              : 'Invite your friends to join JersApp'}
          </Text>
          {!searchText && (
            <TouchableOpacity
              onPress={() => getContacts(userData)}
              style={[styles.retryBtn, {backgroundColor: jersAppTheme.badgeColor}]}>
              <MaterialCommunityIcons name="refresh" size={18} color="white" />
              <Text style={styles.retryText}>Sync Contacts</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SurfaceLayout>
  );
}

/** Generate a consistent avatar color from name */
function getAvatarColor(name, fallback) {
  const colors = ['#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#3182CE', '#805AD5', '#D53F8C'];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  countText: {
    fontSize: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 14,
    borderBottomWidth: 0.5,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  contactInfo: {
    flex: 1,
    gap: 3,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 12,
  },
  chatIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  inviteText: {
    fontSize: 12,
    fontWeight: '600',
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 2,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  skeletonText: {
    flex: 1,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
  loadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
