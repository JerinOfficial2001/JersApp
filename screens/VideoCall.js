// React Native component for P2P communication

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {View, Text, Button, Alert} from 'react-native';
import io from 'socket.io-client';
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

const VideoCall = ({route, navigation, ...props}) => {
  const {Data} = useContext(MyContext);
  const {receiverId} = route.params;

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  // const [peerConnection, setPeerConnection] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setincomingCall] = useState(null);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnection = useRef(null);
  const {socket, offer, setoffer, answer, setanswer} = useSocketHook();

  useEffect(() => {
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

    // Handle incoming ICE candidates
    pc.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('icecandidate', {
          from: Data?._id,
          to: receiverId,
          candidate: event.candidate,
        });
      }
    };

    // Handle incoming streams
    pc.ontrack = event => {
      setRemoteStream(event.streams[0]);
      remoteStreamRef.current = event.streams[0];
    };

    // Start signaling with the peer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', {
      to: receiverId,
      offer,
      from: Data._id,
      localStream,
    });
  };
  const handleIncomingCall = async data => {
    console.log('handleIncomingCall', peerConnection.current);
    // if (!peerConnection.current) return;
    if (peerConnection.current) {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(data.offer),
      );
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      console.log('testAnswer', answer);
      setincomingCall(answer);
    } else {
      Alert.alert('handleIncomingCall null');
    }
  };
  const attendCall = data => {
    console.log('attendCall', incomingCall);
    socket.emit('answer', {
      from: Data._id,
      to: receiverId,
      answer: incomingCall,
      remoteStream,
    });
  };
  const handleAnswerCall = async data => {
    console.log('answer call', peerConnection.current);
    if (!peerConnection.current) return;
    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(data.answer),
    );
  };
  const endCall = () => {
    setanswer(null);
    setoffer(null);
    navigation.goBack();
  };
  // Handle incoming offers and answers
  useEffect(() => {
    console.log('offer', offer);
    if (!offer) return;
    handleIncomingCall(offer);
  }, [offer]);
  useEffect(() => {
    console.log('answer', answer);
    if (!answer) return;
    handleAnswerCall(answer);
  }, [answer]);

  useEffect(() => {
    if (!socket || !peerConnection) return;

    socket.on('offer', async data => {
      setincomingCall(data);

      // if (!peerConnection.current) return;

      // await peerConnection.current.setRemoteDescription(
      //   new RTCSessionDescription(data.offer),
      // );
      // const answer = await peerConnection.current.createAnswer();
      // await peerConnection.current.setLocalDescription(answer);
      // socket.emit('answer', {from: Data._id, to: data.from, answer});
    });

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

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('icecandidate');
    };
  }, [socket, peerConnection]);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <View style={{marginBottom: 20}}>
        <Text>Local Stream</Text>
        {localStream && (
          <RTCView
            streamURL={localStream.toURL()}
            style={{width: 200, height: 150}}
          />
        )}
      </View>
      <View style={{marginBottom: 20}}>
        <Text>Remote Stream</Text>
        {remoteStream ||
          (answer && (
            <RTCView
              streamURL={
                remoteStream.toURL() || remoteStream?.remoteStream.toURL()
              }
              style={{width: 200, height: 150}}
            />
          ))}
      </View>
      <Button
        title={isCalling ? 'Calling...' : 'Start Call'}
        disabled={isCalling || !localStream}
        onPress={() => {
          setIsCalling(true);
          startCall();
        }}
      />
      {incomingCall && (
        <Button
          title="Attend"
          // disabled={isCalling || !localStream}
          onPress={attendCall}
        />
      )}
      {incomingCall && (
        <Button
          title="Decline"
          // disabled={isCalling || !localStream}
          onPress={endCall}
        />
      )}
    </View>
  );
};

export default VideoCall;
