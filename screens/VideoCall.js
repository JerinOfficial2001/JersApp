// React Native component for P2P communication

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
  Button,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  RTCView,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';
import {MyContext} from '../App';
import {useSocketHook} from '../utils/socket';
import {useFocusEffect} from '@react-navigation/native';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {IconButton} from 'react-native-paper';

const VideoCall = ({route, navigation, ...props}) => {
  const {Data} = useContext(MyContext);
  const {receiverId, type} = route.params;

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  // const [peerConnection, setPeerConnection] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setincomingCall] = useState(null);
  const [answerData, setanswerData] = useState(null);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnection = useRef(null);
  const {socket, offer, setoffer, answer, setanswer} = useSocketHook();
  const [reSizeVideo, setreSizeVideo] = useState(false);
  useEffect(() => {
    if (type) {
      setincomingCall(type);
      handleIncomingCall(type);
    } else {
      startCall();
      setIsCalling(true);
    }
    const getLocalStream = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setLocalStream(stream);
        localStreamRef.current = stream;
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    getLocalStream();

    return () => {
      // Clean up resources
      if (localStreamRef.current) {
        localStreamRef.current.release();
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.release();
      }
    };
  }, []);

  const startCall = async () => {
    const configuration = {
      iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
    };
    const pc = new RTCPeerConnection(configuration);

    peerConnection.current = pc;

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    // Start signaling with the peer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', {
      to: receiverId,
      offer,
      from: Data._id,
    });
  };

  useEffect(() => {
    if (!socket || !peerConnection) return;

    // socket.on('offer', async data => {
    //   setincomingCall(data);
    //   handleIncomingCall(data);
    //   // if (!peerConnection.current) return;

    //   // await peerConnection.current.setRemoteDescription(
    //   //   new RTCSessionDescription(data.offer),
    //   // );
    //   // const answer = await peerConnection.current.createAnswer();
    //   // await peerConnection.current.setLocalDescription(answer);
    //   // socket.emit('answer', {from: Data._id, to: data.from, answer});
    // });

    // socket.on('answer', async data => {
    //   if (!peerConnection.current) return;
    //   await peerConnection.current.setRemoteDescription(
    //     new RTCSessionDescription(data.answer),
    //   );
    // });

    socket.on('icecandidate', async data => {
      if (!peerConnection.current) return;
      try {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(data.candidate),
        );
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });
    if (peerConnection.current) {
      const pc = peerConnection.current;
      pc.onicecandidate = event => {
        console.log('testOnIceCandidate');
        if (event.candidate) {
          console.log('Sending ICE candidate to remote peer:', event.candidate);
          socket.emit('icecandidate', {
            from: Data?._id,
            to: receiverId,
            candidate: event.candidate,
          });
        }
      };
      pc.ontrack = event => {
        console.log('Received remote stream:', event.streams);
        if (event.streams && event.streams.length > 0) {
          setRemoteStream(event.streams[0]);
          remoteStreamRef.current = event.streams[0];
        }
      };
      pc.oniceconnectionstatechange = event => {
        console.log('ICE connection state change:', pc.iceConnectionState);
      };
    }
    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('icecandidate');
    };
  }, [socket, peerConnection, peerConnection?.current]);
  //*From Receiver function *//
  const handleIncomingCall = async data => {
    const configuration = {
      iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
    };
    const pc = new RTCPeerConnection(configuration);

    peerConnection.current = pc;

    console.log('handleIncomingCall');

    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    } else {
      Alert.alert('handleIncomingCall null');
    }
  };
  const attendCall = async data => {
    if (peerConnection.current) {
      const answer = await peerConnection.current.createAnswer();
      console.log(answer, 'PC answer');
      await peerConnection.current.setLocalDescription(answer);

      socket.emit('answer', {
        from: Data._id,
        to: receiverId,
        answer: answer,
        remoteStream: '',
      });
    } else {
      Alert.alert('attendCall null');
    }
  };
  const handleAnswerCall = async data => {
    console.log('handleAnswerCall');

    if (!peerConnection.current) {
      console.warn('Peer connection is not initialized.');
      return;
    }

    try {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(data.answer),
      );
      setIsCalling(false);
    } catch (error) {
      console.error('Error setting remote description:', error);
      return;
    }
  };

  const endCall = () => {
    setanswer(null);
    setoffer(null);
    navigation.goBack();
  };
  // Handle incoming offers and answers
  // useEffect(() => {
  //   console.log('offer');
  //   if (!offer) return;
  //   handleIncomingCall(offer);
  // }, [offer]);
  useEffect(() => {
    if (!answer) return;
    handleAnswerCall(answer);
  }, [answer]);
  const styles = StyleSheet.create({
    floatVideo: {
      position: 'absolute',
      top: 20,
      right: 20,
      width: 100,
      height: 200,
    },
    mainVideo: {
      width: '100%',
      height: '100%',
    },
  });
  const handleVideoResize = () => {
    setreSizeVideo(!reSizeVideo);
  };
  return (
    <SurfaceLayout title={'name'}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          flexDirection: 'column',
        }}>
        {localStream && (
          <Pressable
            // onPress={reSizeVideo ? handleVideoResize : undefined}
            style={!reSizeVideo ? styles.mainVideo : styles.floatVideo}>
            <RTCView
              streamURL={localStream.toURL()}
              style={{height: '100%', width: '100%'}}
            />
          </Pressable>
        )}
        {remoteStream && (
          <Pressable
            // onPress={!reSizeVideo ? handleVideoResize : undefined}
            style={reSizeVideo ? styles.mainVideo : styles.floatVideo}>
            <RTCView
              streamURL={remoteStream.toURL()}
              style={{height: '100%', width: '100%'}}
            />
          </Pressable>
        )}

        {incomingCall && (
          <TouchableOpacity
            style={{
              backgroundColor: 'green',
              height: 60,
              width: 60,
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              bottom: 30,
              left: 50,
            }}
            onPress={attendCall}>
            <MaterialIcons name="call" size={30} color={'white'} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{
            backgroundColor: 'red',
            height: 60,
            width: 60,
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            bottom: 30,
            right: incomingCall ? 50 : '',
          }}
          onPress={endCall}>
          <MaterialIcons name="call-end" size={30} color={'white'} />
        </TouchableOpacity>
        {isCalling && (
          <Text style={{position: 'absolute', bottom: 100, color: 'white'}}>
            Calling...
          </Text>
        )}
      </View>
    </SurfaceLayout>
  );
};

export default VideoCall;
