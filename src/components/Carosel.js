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
const Carousel = ({navigation, data, preview, text}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLastImage, setIsLastImage] = useState(false);
  const carouselRef = useRef(null);
  const {jersAppTheme} = useContext(MyContext);

  const handleScroll = event => {
    const {contentOffset} = event.nativeEvent;
    const index = Math.round(contentOffset.x / Dimensions.get('window').width);
    setCurrentIndex(index);
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex === data.length - 1 && !preview) {
        setIsLastImage(true);
      } else {
        if (!preview) {
          setIsLastImage(false);
          carouselRef.current.scrollTo({
            x: (currentIndex + 1) * Dimensions.get('window').width,
          });
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
      carouselRef.current.scrollTo({
        x: (index + 1) * Dimensions.get('window').width,
      });
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
                activeOpacity={1} // Adjust the opacity when pressed
              >
                {item.type == 'video/mp4' ? (
                  <Video
                    onLoad={() => {
                      setisLoading(false);
                    }}
                    source={{uri: status?.file?.url}}
                    style={{height: '80%', width: '100%'}}
                    paused={false}
                    onEnd={() => {
                      props.navigation.navigate('Status');
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
          // )
        }
      </ScrollView>
      <Text style={{color: 'white'}}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  touchableOpacity: {
    width: Dimensions.get('window').width,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
});

export default Carousel;
