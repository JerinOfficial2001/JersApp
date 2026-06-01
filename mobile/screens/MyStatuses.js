import React, {useContext, useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {MyContext} from '../App';
import {Avatar, ActivityIndicator} from 'react-native-paper';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import {DeleteStatus, GetAllStatus} from '../src/controllers/status';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MyStatuses({route, navigation}) {
  const {jersAppTheme, Data} = useContext(MyContext);
  const {statusId, initialFiles} = route.params;
  const [files, setFiles] = useState(initialFiles || []);
  const [deletingId, setDeletingId] = useState(null);

  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    
    if (isToday) {
      return `Today, ${timeStr}`;
    } else if (isYesterday) {
      return `Yesterday, ${timeStr}`;
    } else {
      return `${date.toLocaleDateString([], {month: 'short', day: 'numeric'})}, ${timeStr}`;
    }
  };

  const handleDelete = (publicId) => {
    Alert.alert(
      'Delete Status Update?',
      'This status update will be deleted for everyone who can see it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(publicId);
            const res = await DeleteStatus(statusId, publicId);
            if (res && res.status === 'ok') {
              const updatedFiles = files.filter(f => f.public_id !== publicId);
              setFiles(updatedFiles);
              if (updatedFiles.length === 0) {
                navigation.goBack();
              }
            }
            setDeletingId(null);
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: jersAppTheme.main,
    },
    list: {
      paddingVertical: 8,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: jersAppTheme.appBar + '20', // subtle line
    },
    mediaPreview: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: jersAppTheme.appBar,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    thumbnail: {
      width: '100%',
      height: '100%',
    },
    infoContainer: {
      flex: 1,
      marginLeft: 16,
      justifyContent: 'center',
    },
    timeText: {
      fontSize: 15,
      fontWeight: '600',
      color: jersAppTheme.title,
    },
    viewsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    viewsText: {
      fontSize: 13,
      color: jersAppTheme.subText,
      marginLeft: 4,
    },
    deleteButton: {
      padding: 10,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: jersAppTheme.subText,
      textAlign: 'center',
    },
  });

  return (
    <SurfaceLayout title="My Status">
      <View style={styles.container}>
        {files.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No status updates</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {files.map((file, index) => {
              const isVideo = file.format?.includes('video') || file.url?.endsWith('.mp4') || file.url?.includes('.mp4');
              const hasValidUrl = file.url && file.url !== 'null' && file.url !== 'undefined' && file.url.startsWith('http');
              return (
                <View key={file.public_id || index} style={styles.itemContainer}>
                  {/* Media Thumbnail */}
                  <TouchableOpacity
                    style={styles.mediaPreview}
                    onPress={() => {
                      navigation.navigate('PlayStatus', {
                        id: statusId,
                      });
                    }}
                  >
                    {file.isText ? (
                      <View
                        style={[
                          StyleSheet.absoluteFillObject,
                          {
                            backgroundColor: file.backgroundColor || '#075E54',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 4,
                          },
                        ]}>
                        <Text
                          style={{
                            color: 'white',
                            fontSize: 8,
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                          numberOfLines={3}>
                          {file.text}
                        </Text>
                      </View>
                    ) : !hasValidUrl ? (
                      <View
                        style={[StyleSheet.absoluteFillObject, {
                          backgroundColor: jersAppTheme.appBar,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }]}>
                        <Ionicons name="image-outline" size={22} color={jersAppTheme.subText} />
                      </View>
                    ) : (
                      <>
                        <Image
                          source={{uri: file.url}}
                          style={styles.thumbnail}
                          resizeMode="cover"
                        />
                        {isVideo && (
                          <View style={[StyleSheet.absoluteFillObject, {backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'}]}>
                            <Ionicons name="play" size={20} color="white" />
                          </View>
                        )}
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Info (Upload Date & Time, and mock Views) */}
                  <View style={styles.infoContainer}>
                    <Text style={styles.timeText}>{formatTime(file.createdAt)}</Text>
                    <View style={styles.viewsContainer}>
                      <Ionicons name="eye-outline" size={16} color={jersAppTheme.subText} />
                      <Text style={styles.viewsText}>
                        {(file.viewedBy?.length || 0)} views
                      </Text>
                    </View>
                  </View>

                  {/* Delete Button */}
                  {deletingId === file.public_id ? (
                    <ActivityIndicator size="small" color={jersAppTheme.badgeColor} />
                  ) : (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(file.public_id)}
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={22}
                        color={jersAppTheme.subText}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SurfaceLayout>
  );
}
