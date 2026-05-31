import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Animated,
  PanResponder,
} from 'react-native';
import {
  LiveKitRoom,
  useTracks,
  VideoTrack,
  isTrackReference,
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import axios from 'axios';
import { MyContext } from '../App';
import { useSocketHook } from '../utils/socket';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { expressApi } from '../src/api';

const LIVEKIT_URL = 'wss://livekit.codefam.fun';

const VideoCall = ({route, navigation}) => {
  const {Data} = useContext(MyContext);
  const {receiverId, type, name} = route.params;

  const [token, setToken] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(Platform.OS !== 'android');
  const {socket, setoffer, setanswer} = useSocketHook();

  // On mount, determine if this is an incoming call or outgoing call
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const grants = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
          if (
            grants[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED &&
            grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED
          ) {
            setHasPermissions(true);
          } else {
            Alert.alert('Permission Required', 'Camera and Audio permissions are required to make video calls.');
            navigation.goBack();
          }
        } catch (err) {
          console.warn('Error requesting permissions:', err);
        }
      }
    };
    requestPermissions();

    if (type) {
      // Incoming call: type contains the offer payload with roomName
      setIncomingCall(type);
      setRoomName(type.roomName);
    } else {
      // Outgoing call: generate room name and fetch token, then notify peer
      const generatedRoom = `room_${Data._id}_${receiverId}_${Date.now()}`;
      setRoomName(generatedRoom);
      setIsCalling(true);
      
      axios.get(`${expressApi}/get-token`, {
        params: {
          roomName: generatedRoom,
          participantName: Data._id,
        }
      })
      .then(res => {
        setToken(res.data.token);
        // Send the socket offer to notify the receiver
        socket.emit('offer', {
          to: receiverId,
          from: Data._id,
          name: Data?.name || Data?.userName,
          roomName: generatedRoom,
        });
      })
      .catch(err => {
        console.error('Error fetching token for outgoing call:', err);
        Alert.alert('Error', 'Could not initialize call.');
        navigation.goBack();
      });
    }
  }, []);

  // Listen to socket events for call acceptance or rejection/ended
  useEffect(() => {
    if (!socket) return;

    socket.on('answer', data => {
      console.log('Call answered by peer');
      setIsCalling(false);
      setIsCallAccepted(true);
    });

    socket.on('callend', data => {
      console.log('Call ended by peer');
      cleanupAndExit();
    });

    return () => {
      socket.off('answer');
      socket.off('callend');
    };
  }, [socket]);

  const attendCall = async () => {
    if (!roomName) return;
    try {
      const res = await axios.get(`${expressApi}/get-token`, {
        params: {
          roomName: roomName,
          participantName: Data._id,
        }
      });
      setToken(res.data.token);
      setIsCallAccepted(true);
      // Emit answer to let the caller know we accepted
      socket.emit('answer', {
        to: receiverId,
        from: Data._id,
      });
    } catch (err) {
      console.error('Error accepting call:', err);
      Alert.alert('Error', 'Could not accept call.');
    }
  };

  const declineCall = () => {
    socket.emit('callend', {
      from: Data._id,
      to: receiverId,
    });
    cleanupAndExit();
  };

  const endCall = () => {
    socket.emit('callend', {
      from: Data._id,
      to: receiverId,
    });
    cleanupAndExit();
  };

  const cleanupAndExit = () => {
    setToken(null);
    setanswer(null);
    setoffer(null);
    navigation.navigate('Message', {
      id: receiverId,
      receiverId,
      userID: Data._id,
    });
  };

  return (
    <SurfaceLayout title={name || 'Video Call'}>
      <View style={styles.container}>
        {token && hasPermissions ? (
          <LiveKitRoom
            serverUrl={LIVEKIT_URL}
            token={token}
            connect={true}
            video={true}
            audio={true}
            onDisconnected={() => {
              cleanupAndExit();
            }}
            style={styles.roomContainer}
          >
            <RoomView onEndCall={endCall} isCallAccepted={isCallAccepted} isCalling={isCalling} name={name} />
          </LiveKitRoom>
        ) : (
          <View style={styles.nonConnectedContainer}>
            {incomingCall && !isCallAccepted ? (
              <View style={styles.centerContent}>
                <Text style={styles.title}>{name || 'User'}</Text>
                <Text style={styles.subtitle}>Incoming Video Call...</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.circleButton, { backgroundColor: 'green' }]} onPress={attendCall}>
                    <MaterialIcons name="call" size={30} color={'white'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.circleButton, { backgroundColor: 'red' }]} onPress={declineCall}>
                    <MaterialIcons name="call-end" size={30} color={'white'} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.centerContent}>
                <Text style={styles.title}>{name || 'User'}</Text>
                <Text style={styles.subtitle}>{isCalling ? 'Calling...' : 'Connecting...'}</Text>
                <ActivityIndicator size="large" color="#34B7F1" style={{ marginTop: 20 }} />
                <TouchableOpacity style={[styles.circleButton, { backgroundColor: 'red', marginTop: 40 }]} onPress={endCall}>
                  <MaterialIcons name="call-end" size={30} color={'white'} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </SurfaceLayout>
  );
};

const RoomView = ({ onEndCall, isCallAccepted, isCalling, name }) => {
  const tracks = useTracks(
    [Track.Source.Camera],
    { onlyCopresence: false }
  );
  const [reSizeVideo, setReSizeVideo] = useState(false);

  // Distinguish local track and remote track
  const localTrack = tracks.find(t => isTrackReference(t) && t.participant.isLocal);
  const remoteTrack = tracks.find(t => isTrackReference(t) && !t.participant.isLocal);

  const mainTrack = reSizeVideo ? localTrack : remoteTrack;
  const floatTrack = reSizeVideo ? remoteTrack : localTrack;

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gestureState) => {
        pan.flattenOffset();
        // If movement is very small, treat it as a press to swap/resize the videos
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          setReSizeVideo(prev => !prev);
        }
      },
    })
  ).current;

  return (
    <View style={styles.fullScreen}>
      {/* Background or Main Track */}
      {mainTrack && isTrackReference(mainTrack) ? (
        <Pressable style={styles.mainVideo} onPress={() => setReSizeVideo(!reSizeVideo)}>
          <VideoTrack trackRef={mainTrack} style={styles.fullScreen} zOrder={0} />
        </Pressable>
      ) : (
        <View style={[styles.mainVideo, styles.placeholderBg]}>
          {isCalling || !remoteTrack ? (
            <View style={styles.centerContent}>
              <Text style={styles.title}>{name || 'User'}</Text>
              <Text style={styles.subtitle}>Waiting for connection...</Text>
              <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />
            </View>
          ) : (
            <Ionicons name="videocam" size={60} color={'rgba(255,255,255,0.4)'} />
          )}
        </View>
      )}

      {/* Floating Picture-in-Picture Track */}
      {floatTrack && isTrackReference(floatTrack) && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.floatVideo,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
        >
          <VideoTrack trackRef={floatTrack} style={styles.fullScreen} zOrder={1} />
        </Animated.View>
      )}

      {/* Bottom Controls Overlay */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={[styles.circleButton, { backgroundColor: 'red' }]} onPress={onEndCall}>
          <MaterialIcons name="call-end" size={30} color={'white'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  roomContainer: {
    flex: 1,
  },
  nonConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mainVideo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  placeholderBg: {
    backgroundColor: '#1c1c1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatVideo: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 120,
    height: 180,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: '#000000',
    zIndex: 10,
    elevation: 10,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: 16,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 60,
    gap: 40,
  },
  circleButton: {
    height: 64,
    width: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  controlsRow: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
});

export default VideoCall;
