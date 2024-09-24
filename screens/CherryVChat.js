import React, {useContext, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import WebView from 'react-native-webview';
import Loader from '../src/components/Loader';
import {MyContext} from '../App';

const CherryVChat = () => {
  const [loading, setLoading] = useState(true);
  const {Data} = useContext(MyContext);

  return (
    <View style={styles.container}>
      {/* {loading && <Loader />} */}
      <WebView
        source={{
          uri: 'http://cherry-vchat.vercel.app/solovchat?userid=' + Data?._id,
        }}
        style={styles.webview}
        javaScriptEnabled={true}
        mediaPlaybackRequiresUserAction={false} // Allow autoplay
        allowsInlineMediaPlayback={true}
        startInLoadingState={true}
        originWhitelist={['*']}
        onError={syntheticEvent => {
          const {nativeEvent} = syntheticEvent;
          console.error('WebView error: ', nativeEvent);
          setLoading(false);
        }}
        onHttpError={syntheticEvent => {
          const {nativeEvent} = syntheticEvent;
          console.error('HTTP error: ', nativeEvent);
          setLoading(false);
        }}
        onMessage={event => {
          console.log(event.nativeEvent.data);
        }}
        mixedContentMode="always" // Allow mixed content if necessary
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  webview: {
    flex: 1,
  },
});

export default CherryVChat;
