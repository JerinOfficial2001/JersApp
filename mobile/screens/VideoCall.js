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
  const {receiverId, type, name} = route.params;

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
  const [isCallAccepted, setisCallAccepted] = useState(false);

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
  const pcRef = useRef(null);
  if (!pcRef.current || pcRef.current.signalingState === 'closed') {
    pcRef.current = new RTCPeerConnection(configuration);
  }
  const pc = pcRef.current;
  const iceCandidatesQueueRef = useRef([]);
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
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!socket || !pc) return;

    socket.on('icecandidate', async data => {
      try {
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(
            new RTCIceCandidate(data.candidate),
          );
        } else {
          iceCandidatesQueueRef.current.push(data.candidate);
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    socket.on('answer', async data => {
      console.log('answer received');
      handleAnswerCall(data);
    });

    socket.on('callend', data => {
      if (data && data.state) {
        if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
        }
        setremoteUrl('');
        setanswer(null);
        setoffer(null);
        setpeerConnection(null);
        setRemoteStream(null);
        setLocalStream(null);
        setreceiverPC(null);
        setisCallAccepted(false);
        navigation.navigate('Message', {
          id: receiverId,
          receiverId,
          userID: Data._id,
        });
      }
    });

    return () => {
      socket.off('answer');
      socket.off('icecandidate');
      socket.off('callend');
    };
  }, [socket, pc]);

  useEffect(() => {
    if (!socket || !pc) return;

    pc.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('icecandidate', {
          from: Data?._id,
          to: receiverId,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = event => {
      console.log(
        'ICE connection state change:',
        pc.iceConnectionState,
      );
    };

    pc.ontrack = event => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        remoteStreamRef.current = event.streams[0];
      } else {
        console.log('No streams on track');
      }
    };

    return () => {
      pc.onicecandidate = null;
      pc.oniceconnectionstatechange = null;
      pc.ontrack = null;
    };
  }, [socket, pc]);

  const startCall = async stream => {
    if (stream) {
      stream.getTracks().forEach(track => {
        return pc.addTrack(track, stream);
      });
    }
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', {
      to: receiverId,
      offer,
      from: Data._id,
      name: Data?.name || Data?.userName,
    });
    setpeerConnection(pc);
  };

  const handleAnswerCall = async data => {
    console.log('handleAnswerCall');
    if (!pc) return;

    try {
      await pc.setRemoteDescription(
        new RTCSessionDescription(data.answer),
      );
      // Process queued candidates
      iceCandidatesQueueRef.current.forEach(async candidate => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding queued ICE candidate:', e);
        }
      });
      iceCandidatesQueueRef.current = [];
      setIsCalling(false);
      setisCallAccepted(true);
    } catch (error) {
      console.error('Error setting remote description:', error);
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
        socket.emit('icecandidate', {
          from: Data?._id,
          to: receiverId,
          candidate: event.candidate,
        });
      }
    };

    receiverPC.oniceconnectionstatechange = event => {
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
    if (stream) {
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
    }
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        // Process queued candidates
        iceCandidatesQueueRef.current.forEach(async candidate => {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding queued ICE candidate:', e);
          }
        });
        iceCandidatesQueueRef.current = [];
      } catch (error) {
        console.error('Error setting remote description in handleIncomingCall:', error);
      }
    }
    setpeerConnection(pc);
  };

  const attendCall = async () => {
    if (pc) {
      try {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer', {
          from: Data._id,
          to: receiverId,
          answer: answer,
          remoteStream: '',
        });
        setisCallAccepted(true);
      } catch (error) {
        console.error('Error in attendCall:', error);
      }
    } else {
      Alert.alert('attendCall null');
    }
  };
  const [remoteUrl, setremoteUrl] = useState('');
  useEffect(() => {
    if (isCallAccepted && remoteStream) {
      console.log('remoteStream', {
        state: remoteStream && isCallAccepted,
        remoteStream: remoteStream.toURL(),
        isCallAccepted,
      });
      setremoteUrl(remoteStream.toURL());
      Alert.alert(remoteStream.toURL());
    } else {
      console.log('isCallAccepted', isCallAccepted);
    }
  }, [isCallAccepted, remoteStream]);

  const endCall = () => {
    socket.emit('callend', {
      from: Data._id,
      to: receiverId,
    });
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setremoteUrl('');
    setanswer(null);
    setoffer(null);
    navigation.goBack();
    setpeerConnection(null);
    setRemoteStream(null);
    setLocalStream(null);
    setreceiverPC(null);
    setisCallAccepted(false);
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

  return (
    <SurfaceLayout title={name || 'Video Call'}>
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
              mirror={true}
              style={{height: '100%', width: '100%', objectFit: 'contain'}}
            />
          </Pressable>
        )}

        {remoteUrl && (
          <Pressable
            // onPress={!reSizeVideo ? handleVideoResize : undefined}
            style={reSizeVideo ? styles.mainVideo : styles.floatVideo}>
            <RTCView
              streamURL={remoteUrl}
              style={{height: '100%', width: '100%'}}
            />
          </Pressable>
        )}
        {/* <View
          style={[
            reSizeVideo ? styles.mainVideo : styles.floatVideo,
            {
              backgroundColor: 'black',
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}>
          <Ionicons name="videocam" size={26} color={'white'} />
        </View> */}
        {incomingCall && !isCallAccepted && (
          <View style={{position: 'absolute', top: 100, alignItems: 'center', width: '100%'}}>
            <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>
              {name || 'User'}
            </Text>
            <Text style={{color: '#34B7F1', fontSize: 16, marginTop: 8}}>
              Incoming Call...
            </Text>
          </View>
        )}
        {incomingCall && !isCallAccepted && (
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
            right: incomingCall && !isCallAccepted ? 50 : '',
          }}
          onPress={endCall}>
          <MaterialIcons name="call-end" size={30} color={'white'} />
        </TouchableOpacity>
        {isCalling && (
          <View style={{position: 'absolute', top: 100, alignItems: 'center', width: '100%'}}>
            <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>
              {name || 'User'}
            </Text>
            <Text style={{color: '#a0a0a0', fontSize: 16, marginTop: 8}}>
              Calling...
            </Text>
          </View>
        )}
      </View>
    </SurfaceLayout>
  );
};

export default VideoCall;
