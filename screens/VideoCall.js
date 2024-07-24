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
import Ionicons from 'react-native-vector-icons/Ionicons';

const VideoCall = ({route, navigation, ...props}) => {
  const {Data} = useContext(MyContext);
  const {receiverId, type} = route.params;

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setincomingCall] = useState(null);
  const [answerData, setanswerData] = useState(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const [peerConnection, setpeerConnection] = useState(null);
  const {socket, offer, setoffer, answer, setanswer} = useSocketHook();
  const [reSizeVideo, setreSizeVideo] = useState(false);

  const configuration = {
    configuration: {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    },
    iceServers: [
      {urls: 'stun:stun.l.google.com:19302'},
      {urls: 'stun:stun1.l.google.com:19302'},
    ],
  };
  const pc = new RTCPeerConnection(configuration);
  useEffect(() => {
    const getLocalStream = async () => {
      try {
        await mediaDevices
          .getUserMedia({
            audio: true,
            video: true,
          })
          .then(stream => {
            setLocalStream(stream);
            localStreamRef.current = stream;

            if (type) {
              setincomingCall(type);
              handleIncomingCall(type, stream);
            } else {
              startCall(stream);
              setIsCalling(true);
            }
          });
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

  useEffect(() => {
    if (!socket || !peerConnection) return;

    socket.on('icecandidate', async data => {
      try {
        if (peerConnection) {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(data.candidate),
          );
        } else if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          console.log('Pc and Peerconnection is empty');
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    socket.on('answer', async data => {
      console.log('answer');
      handleAnswerCall(data);
    });

    socket.on('callend', data => {
      if (data && data.state) {
        setanswer(null);
        setoffer(null);
        setpeerConnection(null);
        setRemoteStream(null);
        setLocalStream(null);
        setreceiverPC(null);

        navigation.navigate('Message', {
          id: receiverId,
          receiverId,
          userID: Data._id,
        });
      }
    });

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('icecandidate');
    };
  }, [socket, peerConnection, pc]);

  useEffect(() => {
    if (peerConnection) {
      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          console.log('peerConnection', peerConnection);
          // console.log('Sending ICE candidate to remote peer:', event.candidate);
          socket.emit('icecandidate', {
            from: Data?._id,
            to: receiverId,
            candidate: event.candidate,
          });
        }
      };

      peerConnection.oniceconnectionstatechange = event => {
        // console.log('peerConnection', peerConnection);

        console.log(
          'ICE connection state change:',
          peerConnection.iceConnectionState,
        );
      };
      peerConnection.ontrack = event => {
        console.log('Received remote stream:', event.streams);
        if (event.streams) {
          setRemoteStream(event.streams[0]);
          remoteStreamRef.current = event.streams[0];
        } else {
          console.log('No streams on track');
        }
      };
    } else if (pc) {
      pc.onicecandidate = event => {
        if (event.candidate) {
          console.log('peerConnection', peerConnection);
          // console.log('Sending ICE candidate to remote peer:', event.candidate);
          socket.emit('icecandidate', {
            from: Data?._id,
            to: receiverId,
            candidate: event.candidate,
          });
        }
      };

      pc.oniceconnectionstatechange = event => {
        // console.log('peerConnection', peerConnection);

        console.log(
          'ICE connection state change:',
          peerConnection.iceConnectionState,
        );
      };
      pc.ontrack = event => {
        console.log('Received remote stream:', event.streams);
        if (event.streams) {
          setRemoteStream(event.streams[0]);
          remoteStreamRef.current = event.streams[0];
        } else {
          console.log('No streams on track');
        }
      };
    } else {
      console.log('onIceCandidate pc and peerconnection is empty');
    }
  }, [peerConnection]);

  const startCall = async stream => {
    if (stream) {
      stream.getTracks().forEach(track => {
        return pc.addTrack(track, stream);
      });
    }
    // Start signaling with the peer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', {
      to: receiverId,
      offer,
      from: Data._id,
    });
    setpeerConnection(pc);
  };
  const handleAnswerCall = async data => {
    console.log('handleAnswerCall');

    if (!peerConnection) {
      console.warn('Peer connection is not initialized.');
      return;
    }

    try {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer),
      );
      setpeerConnection(peerConnection);
      setIsCalling(false);
    } catch (error) {
      console.error('Error setting remote description:', error);
      return;
    }
  };
  //*Receiver function *//
  const ReceivversPC = new RTCPeerConnection(configuration);
  const [receiverPC, setreceiverPC] = useState(null);
  useEffect(() => {
    if (!receiverPC) return;
    receiverPC.onicecandidate = event => {
      if (event.candidate) {
        console.log('receiverPC', receiverPC);
        // console.log('Sending ICE candidate to remote peer:', event.candidate);
        socket.emit('icecandidate', {
          from: Data?._id,
          to: receiverId,
          candidate: event.candidate,
        });
      }
    };

    receiverPC.oniceconnectionstatechange = event => {
      // console.log('receiverPC', receiverPC);

      console.log(
        'ICE connection state change:',
        receiverPC.iceConnectionState,
      );
    };
    receiverPC.ontrack = event => {
      console.log('Received remote stream:', event.streams);
      if (event.streams) {
        setRemoteStream(event.streams[0]);
        remoteStreamRef.current = event.streams[0];
      } else {
        console.log('No streams on track');
      }
    };
  }, [receiverPC]);
  const handleIncomingCall = async (data, stream) => {
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      console.log('handleIncomingCall', pc);
    } else {
      Alert.alert('handleIncomingCall null');
    }
    setpeerConnection(pc);
  };
  const attendCall = async data => {
    console.log('attend', peerConnection);
    if (peerConnection) {
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(
        new RTCSessionDescription(answer),
      );

      setpeerConnection(peerConnection);
      socket.emit('answer', {
        from: Data._id,
        to: receiverId,
        answer: answer,
        remoteStream: '',
      });
      setincomingCall(null);
    } else {
      Alert.alert('attendCall null');
    }
  };

  const endCall = () => {
    socket.emit('callend', {
      from: Data._id,
      to: receiverId,
    });
    setanswer(null);
    setoffer(null);
    navigation.goBack();
    setpeerConnection(null);
    setRemoteStream(null);
    setLocalStream(null);
    setreceiverPC(null);
  };
  // Handle incoming offers and answers
  // useEffect(() => {
  //   console.log('offer');
  //   if (!offer) return;
  //   handleIncomingCall(offer);
  // }, [offer]);
  // useEffect(() => {
  //   if (!answer) return;
  //   handleAnswerCall(answer);
  // }, [answer]);
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
  console.log('remoteStream', remoteStream);

  return (
    <SurfaceLayout title={'name'}>
      {/* <Button title="call" onPress={startCall} /> */}
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

        {remoteStream ? (
          <Pressable
            // onPress={!reSizeVideo ? handleVideoResize : undefined}
            style={reSizeVideo ? styles.mainVideo : styles.floatVideo}>
            <RTCView
              streamURL={remoteStream.toURL()}
              style={{height: '100%', width: '100%'}}
            />
          </Pressable>
        ) : (
          <View
            style={[
              reSizeVideo ? styles.mainVideo : styles.floatVideo,
              {
                backgroundColor: 'black',
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}>
            <Ionicons name="videocam" size={26} color={'white'} />
          </View>
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
