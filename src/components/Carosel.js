import React, {useState, useEffect, useRef} from 'react';
import {
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import StatusIndicator from './StatusIndicator';

const Carousel = ({navigation, data}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLastImage, setIsLastImage] = useState(false);
  const carouselRef = useRef(null);

  const handleScroll = event => {
    const {contentOffset} = event.nativeEvent;
    const index = Math.round(contentOffset.x / Dimensions.get('window').width);
    setCurrentIndex(index);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex === data.length - 1) {
        setIsLastImage(true);
      } else {
        setIsLastImage(false);
        carouselRef.current.scrollTo({
          x: (currentIndex + 1) * Dimensions.get('window').width,
        });
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
      <StatusIndicator
        currentStatus={currentIndex + 1}
        totalStatus={data.length}
      />
      <ScrollView
        ref={carouselRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={200}>
        {data?.map((item, index) => (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity
              key={index}
              onPress={() => handleImagePress(index)}
              style={styles.touchableOpacity}
              activeOpacity={1} // Adjust the opacity when pressed
            >
              <Image
                key={index}
                source={{uri: item.url}}
                style={styles.image}
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
