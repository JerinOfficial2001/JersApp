import {Modal, Portal} from 'react-native-paper';

import React, {useContext, useEffect, useRef, useState} from 'react';
import {Text, Button, View} from 'react-native';
import {
  RTCView,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';
import {useSocketHook} from '../../utils/socket';

const VideoCallModal = ({receiverId, handleModelClose, visible, Data}) => {
  const containerStyle = {
    backgroundColor: '#3b4a54',
    padding: 20,
    margin: 20,
    borderRadius: 30,
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
  };

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setincomingCall] = useState(null);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const {socket} = useSocketHook();
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
    setPeerConnection(pc);

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
    socket.emit('offer', {to: receiverId, offer, from: Data._id});
  };

  // Handle incoming offers and answers
  useEffect(() => {
    if (!socket || !peerConnection) return;

    socket.on('offer', data => {
      setincomingCall(data);

      // if (!peerConnection.current) return;

      // await peerConnection.current.setRemoteDescription(
      //   new RTCSessionDescription(data.offer),
      // );
      // const answer = await peerConnection.current.createAnswer();
      // await peerConnection.current.setLocalDescription(answer);
      // socket.emit('answer', {from: Data._id, to: data.from, answer});
    });

    socket.on('answer', async data => {
      if (!peerConnection.current) return;
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(data.answer),
      );
    });

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
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleModelClose}
        contentContainerStyle={containerStyle}>
        <Text style={{color: 'gray', fontSize: 14}}>Delete message?</Text>

        <View
          style={{
            width: '100%',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 20,
          }}>
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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
              {remoteStream && (
                <RTCView
                  streamURL={remoteStream.toURL()}
                  style={{width: 200, height: 150}}
                />
              )}
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
                onPress={() => {
                  // setIsCalling(true);
                  // startCall();
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

export default VideoCallModal;
