import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Link, useFocusEffect } from 'expo-router';
import { authClient } from '@/utils/auth-client';
import { useAuth } from '@/contexts/auth-context';
import { useConversation } from '@/hooks/useChatQueries';
import ChatListItem from '@/components/ChatListItem';

const HomeScreen = () => {
const {data:conversations=[] , isLoading , refetch} = useConversation()
  const [refreshing, setRefreshing] = useState(false);
 

useFocusEffect(
  useCallback(()=>{
    refetch()
  },[refetch])
)

if(isLoading && !conversations.length){
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={"large"} color={"#0074ff"}/>
    </View>
  )
}

const onRefresh=async()=>{
  setRefreshing(true);
  await refetch();
  setRefreshing(false)
}

  return (
    <View style={styles.container}>
    <Text style={styles.header}>Chats</Text>
    <FlatList
    data={conversations}
    keyExtractor={(item)=>item.id}
    renderItem={({item})=><ChatListItem user={item}/>}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={"#fff"}/>
    }
    ListEmptyComponent={
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No Chats Yet.</Text>
         <Text style={styles.emptySubText}>Go to Discover to find friends!</Text>
      </View>
    }
    />
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubText: {
    color: "#888",
    fontSize: 14,
    marginTop: 8,
  },
});