import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import StatusIndicator from './StatusIndicator';
import Video from 'react-native-video';
import {Text} from 'react-native-paper';
import {MyContext} from '../../App';
const Carousel = ({navigation, data, preview, text, onIndexChange}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLastImage, setIsLastImage] = useState(false);
  const carouselRef = useRef(null);
  const {jersAppTheme} = useContext(MyContext);

  const handleScroll = event => {
    const {contentOffset} = event.nativeEvent;
    const index = Math.round(contentOffset.x / Dimensions.get('window').width);
    setCurrentIndex(index);
    if (onIndexChange) onIndexChange(index);
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex === data.length - 1 && !preview) {
        setIsLastImage(true);
      } else {
        if (!preview) {
          setIsLastImage(false);
          const nextIndex = currentIndex + 1;
          carouselRef.current.scrollTo({
            x: nextIndex * Dimensions.get('window').width,
          });
          setCurrentIndex(nextIndex);
          if (onIndexChange) onIndexChange(nextIndex);
        }
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, data.length]);

  useEffect(() => {
    if (isLastImage) {
      navigation.navigate('Home');
    }
  }, [isLastImage, navigation]);

  const handleImagePress = index => {
    if (index === data.length - 1) {
      setIsLastImage(true);
    } else {
      setIsLastImage(false);
      const nextIndex = index + 1;
      carouselRef.current.scrollTo({
        x: nextIndex * Dimensions.get('window').width,
      });
      setCurrentIndex(nextIndex);
      if (onIndexChange) onIndexChange(nextIndex);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      {!preview && (
        <StatusIndicator
          currentStatus={currentIndex + 1}
          totalStatus={data.length}
        />
      )}
      <ScrollView
        ref={carouselRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={200}>
        {
          //   typeof data == 'object' ? (
          //   <View
          //     style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          //     <TouchableOpacity
          //       // onPress={() => handleImagePress(index)}
          //       style={styles.touchableOpacity}
          //       activeOpacity={1} // Adjust the opacity when pressed
          //     >
          //       {data.type == 'video/mp4' ? (
          //         <Video
          //           // onLoad={() => {
          //           //   setisLoading(false);
          //           // }}
          //           source={{uri: data?.uri}}
          //           style={{height: '80%', width: '100%'}}
          //           paused={false}
          //           onEnd={() => {
          //             props.navigation.navigate('Status');
          //           }}
          //         />
          //       ) : (
          //         <Image
          //           source={{uri: preview ? data.uri : item?.url}}
          //           style={styles.image}
          //         />
          //       )}
          //     </TouchableOpacity>
          //   </View>
          // ) : (
          data?.map((item, index) => (
            <View
              key={index}
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => handleImagePress(index)}
                style={styles.touchableOpacity}
                activeOpacity={1}
              >
                {item.isText ? (
                  <View
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: item.backgroundColor || '#075E54',
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 30,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 28,
                        fontWeight: '500',
                        textAlign: 'center',
                        lineHeight: 38,
                      }}>
                      {item.text}
                    </Text>
                  </View>
                ) : (item.type == 'video/mp4' || item.format?.includes('video') || item.url?.endsWith('.mp4')) ? (
                  <Video
                    source={{uri: preview ? item?.uri : item?.url}}
                    style={{height: '100%', width: '100%'}}
                    paused={false}
                    resizeMode="contain"
                    controls={true}
                    onEnd={() => {
                      if (!preview) navigation.navigate('Status');
                    }}
                  />
                ) : (
                  <Image
                    key={index}
                    source={{uri: preview ? item?.uri : item?.url}}
                    style={styles.image}
                  />
                )}
              </TouchableOpacity>
            </View>
          ))
        }
      </ScrollView>
      {text && <Text style={styles.captionText}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  touchableOpacity: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  captionText: {
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: '100%',
    paddingTop: 10,
  },
});

export default Carousel;
