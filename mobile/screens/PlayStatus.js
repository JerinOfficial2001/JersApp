import {useFocusEffect} from '@react-navigation/native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {GetStatusByID, RecordStatusView} from '../src/controllers/status';
import Video from 'react-native-video';
import {ActivityIndicator, MD2Colors} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';
import Carousel from '../src/components/Carosel';
import {MyContext} from '../App';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function PlayStatus({route, ...props}) {
  const {jersAppTheme, Data} = useContext(MyContext);

  const [isLoading, setisLoading] = useState(true);
  const {id} = route.params;
  const [status, setstatus] = useState({});
  const [showViews, setShowViews] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useFocusEffect(React.useCallback(() => {}, []));
  
  const fetchStatus = () => {
    GetStatusByID(id).then(data => {
      setstatus(data);
      setisLoading(false);
      
      // Auto-record the first status file view if other user's status
      if (data && data.file && data.file[0] && data.userID !== Data?._id) {
        RecordStatusView(data._id, data.file[0].public_id, Data?._id, Data?.name);
      }
    });
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const [isLastImage, setIsLastImage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status?.file && currentIndex === status.file.length - 1) {
        setIsLastImage(true);
      } else {
        setIsLastImage(false);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [currentIndex, status?.file?.length]);

  useEffect(() => {
    if (isLastImage && !showViews) {
      props.navigation.navigate('Home');
    }
  }, [isLastImage, showViews]);

  const handleIndexChange = (index) => {
    setCurrentIndex(index);
    if (status && status.file && status.file[index] && status.userID !== Data?._id) {
      RecordStatusView(status._id, status.file[index].public_id, Data?._id, Data?.name);
    }
  };

  const activeFile = status?.file?.[currentIndex];
  const realViewers = activeFile?.viewedBy || [];

  const formatViewerTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const styles = StyleSheet.create({
    content: {
      flexDirection: 'column',
      justifyContent: 'center',
      padding: 0,
      flex: 1,
      backgroundColor: '#000',
    },
    imgContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    sendBtn: {
      backgroundColor: jersAppTheme.appBar,
      padding: 15,
      borderRadius: 200,
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewsContainer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
    viewsBar: {
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingVertical: 6,
      paddingHorizontal: 24,
      borderRadius: 20,
      gap: 2,
    },
    bottomSheetContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
      zIndex: 20,
    },
    sheetContent: {
      backgroundColor: jersAppTheme.main,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '55%',
      paddingBottom: 24,
    },
    sheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: jersAppTheme.appBar + '20',
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: jersAppTheme.title,
    },
    closeBtn: {
      padding: 4,
    },
    sheetScroll: {
      paddingHorizontal: 20,
    },
    viewerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: jersAppTheme.appBar + '10',
    },
    avatarFallback: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewerInfo: {
      marginLeft: 12,
      flex: 1,
    },
    viewerName: {
      fontSize: 15,
      fontWeight: '600',
      color: jersAppTheme.title,
    },
    viewerTime: {
      fontSize: 13,
      color: jersAppTheme.subText,
      marginTop: 2,
    },
    noViewsText: {
      fontSize: 14,
      color: jersAppTheme.subText,
      textAlign: 'center',
      marginVertical: 40,
    },
  });

  return (
    <SurfaceLayout>
      <View style={styles.content}>
        {isLoading ? (
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center',
            }}>
            <ActivityIndicator
              animating={true}
              color={jersAppTheme.appBar}
              size="large"
            />
          </View>
        ) : (
          <View style={{flex: 1, position: 'relative'}}>
            <Carousel
              text={status?.text}
              data={status?.file}
              navigation={props.navigation}
              onIndexChange={handleIndexChange}
            />

            {/* WhatsApp views bar for the creator */}
            {status?.userID === Data?._id && (
              <View style={styles.viewsContainer}>
                <TouchableOpacity
                  style={styles.viewsBar}
                  onPress={() => setShowViews(true)}
                >
                  <Ionicons name="chevron-up" size={18} color="white" />
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <Ionicons name="eye" size={16} color="white" />
                    <Text style={{color: 'white', fontSize: 13, fontWeight: '600'}}>
                      {realViewers.length}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom Sheet Views List */}
            {showViews && (
              <View style={styles.bottomSheetContainer}>
                <TouchableOpacity
                  style={StyleSheet.absoluteFillObject}
                  onPress={() => setShowViews(false)}
                />
                
                <View style={styles.sheetContent}>
                  <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Viewed by {realViewers.length}</Text>
                    <TouchableOpacity
                      onPress={() => setShowViews(false)}
                      style={styles.closeBtn}
                    >
                      <Ionicons name="close" size={24} color={jersAppTheme.title} />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.sheetScroll}>
                    {realViewers.length === 0 ? (
                      <Text style={styles.noViewsText}>No views yet</Text>
                    ) : (
                      realViewers.map((viewer, index) => (
                        <View key={index} style={styles.viewerRow}>
                          <View style={[styles.avatarFallback, {backgroundColor: jersAppTheme.appBar}]}>
                            <Text style={{color: 'white', fontWeight: 'bold'}}>{viewer.userName?.[0] || '?'}</Text>
                          </View>
                          <View style={styles.viewerInfo}>
                            <Text style={styles.viewerName}>{viewer.userName}</Text>
                            <Text style={styles.viewerTime}>{formatViewerTime(viewer.viewedAt)}</Text>
                          </View>
                        </View>
                      ))
                    )}
                  </ScrollView>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </SurfaceLayout>
  );
}
