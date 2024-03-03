// // QRCodeScanner.js

// import React, {useState, useEffect} from 'react';
// import {View, Text, StyleSheet} from 'react-native';
// import {RNCamera} from 'react-native-camera';

// const QRCodeScanner = () => {
//   const handleBarCodeRead = event => {
//     // Handle the QR code data
//     console.log('QR Code data:', event.data);
//   };

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
