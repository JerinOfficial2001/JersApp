// // QRCodeScanner.js

// import React, {useState, useEffect} from 'react';
// import {View, Text, StyleSheet} from 'react-native';
// import {RNCamera} from 'react-native-camera';
// import {request, PERMISSIONS} from 'react-native-permissions';

// const QRCodeScanner = () => {
//   const [isCameraAuthorized, setIsCameraAuthorized] = useState(false);

//   useEffect(() => {
//     const checkPermissions = async () => {
//       const result = await request(PERMISSIONS.IOS.CAMERA);
//       setIsCameraAuthorized(result === 'granted');
//     };

//     checkPermissions();
//   }, []);

//   const handleBarCodeRead = event => {
//     // Handle the QR code data
//     console.log('QR Code data:', event.data);
//   };

//   if (!isCameraAuthorized) {
//     return (
//       <View style={styles.container}>
//         <Text>Please grant camera permissions to use the QR code scanner.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <RNCamera
//         style={styles.camera}
//         onBarCodeRead={handleBarCodeRead}
//         captureAudio={false}
//         androidCameraPermissionOptions={{
//           title: 'Permission to use camera',
//           message: 'We need your permission to use your camera',
//           buttonPositive: 'OK',
//           buttonNegative: 'Cancel',
//         }}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   camera: {
//     flex: 1,
//     width: '100%',
//   },
// });

// export default QRCodeScanner;
