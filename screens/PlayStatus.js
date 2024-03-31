import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {GetStatusByID} from '../src/controllers/status';
import Video from 'react-native-video';
import {ActivityIndicator, MD2Colors} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';

export default function PlayStatus({route, ...props}) {
  const [isLoading, setisLoading] = useState(true);
  const {id} = route.params;
  const [status, setstatus] = useState({});
  useFocusEffect(React.useCallback(() => {}, []));
  useEffect(() => {
    GetStatusByID(id).then(data => {
      setstatus(data);
      setisLoading(false);
    });
  }, []);
  // useEffect(() => {
  //   if (status && status.file && status.file.format !== 'mp4') {
  //   }
  // }, [status]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLastImage, setIsLastImage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex === status.file.length - 1) {
        setIsLastImage(true); // Set the state to true when the last image is reached
      } else {
        setIsLastImage(false);
        // carouselRef.current.snapToNext();
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [currentIndex, status?.file?.length]);

  const carouselRef = useRef(null);
  const onSnapToItem = index => {
    setCurrentIndex(index);
  };
  useEffect(() => {
    if (isLastImage) {
      props.navigation.navigate('Home');
    }
  }, [isLastImage]);
  const handleImagePress = index => {
    if (index === status.file.length - 1) {
      setIsLastImage(true);
    } else {
      setIsLastImage(false);
      carouselRef.current.snapToNext();
    }
  };

  return (
    <View style={styles.content}>
      {
        isLoading ? (
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              height: 650,
              justifyContent: 'center',
            }}>
            <ActivityIndicator
              animating={true}
              color={MD2Colors.green400}
              size="large"
            />
          </View>
        ) : (
          // <Carousel
          //   ref={carouselRef}
          //   onSnapToItem={onSnapToItem}
          //   data={status?.file}
          //   scrollEnabled={false}
          //   renderItem={img => {
          //     return (
          //       <TouchableOpacity onPress={() => handleImagePress(img.index)}>
          //         <Image
          //           alt="img"
          //           source={{uri: img.item.url}}
          //           style={{
          //             width: 400,
          //             height: 700,
          //             objectFit: 'contain',
          //           }}
          //         />
          //       </TouchableOpacity>
          //     );
          //   }}
          //   sliderWidth={400}
          //   itemWidth={400}
          //   layout={'default'}
          // />
          <ScrollView>
            {status?.file.length !== 0 &&
              status?.file.map((img, index) => (
                <Image
                  key={index}
                  alt="img"
                  source={{uri: img.url}}
                  style={{height: 400, width: '100%'}}
                />
              ))}
          </ScrollView>
        )

        //   : (
        // <View style={{flex: 1, position: 'relative'}}>
        //   <Video
        //     onLoad={() => {
        //       setisLoading(false);
        //     }}
        //     source={{uri: status?.file?.url}}
        //     style={{height: '80%', width: '100%'}}
        //     paused={false}
        //     onEnd={() => {
        //       props.navigation.navigate('Status');
        //     }}
        //   />
        //   <Text
        //     style={{
        //       position: 'absolute',
        //       bottom: 10,
        //       left: 0,
        //       right: 0,
        //       color: 'white',
        //     }}>
        //     {status?.text}
        //   </Text>
        // </View>
        // )
      }
    </View>
  );
}
const styles = StyleSheet.create({
  content: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 10,
    gap: 2,
    flex: 1,
    backgroundColor: '#3D3D3DD1',
  },
  imgContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  sendBtn: {
    backgroundColor: '#14a95f',
    padding: 15,
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
