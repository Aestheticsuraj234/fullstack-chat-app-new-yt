import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { useAcceptFriendRequest, useCancelFriendRequest, useDiscoverUsers, useRejectFriendRequest, useSendFriendRequest } from '@/hooks/useFriendQueries'
import { UserCard } from '@/components/UserCard'

const DiscoverScreen = () => {
  const [search , setSearch] = useState("")
  const {data:users=[] , isLoading } = useDiscoverUsers(search)
  const sendRequestMutation = useSendFriendRequest();
   const acceptRequestMutation = useAcceptFriendRequest();
    const rejectRequestMutation = useRejectFriendRequest();
    const cancelRequestMutation = useCancelFriendRequest();

  const handleSendRequest = async(receiverId:string)=>{
    sendRequestMutation.mutate(receiverId)
  }

  
    const handleAcceptRequest = async (requestId: string) => {
        acceptRequestMutation.mutate(requestId);
    };

    const handleRejectRequest = async (requestId: string) => {
        rejectRequestMutation.mutate(requestId);
    };

    const handleCancelRequest = async (requestId: string) => {
        cancelRequestMutation.mutate(requestId);
    };


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Discover People</Text>
      <TextInput
      style={styles.searchInput}
      placeholder='Search By Email , Name ...'
      placeholderTextColor={"#aaa"}
      value={search}
      onChangeText={setSearch}
      />

      {
        isLoading && !users.length ? (
          <ActivityIndicator size={"large"} color={"#007aff"} style={{marginTop:20}}/>
        ): (
          <FlatList
          data={users}
          keyExtractor={(item)=>item.id}
          renderItem={({item})=>(
            <UserCard
            user={item}
            onSendRequest={handleSendRequest}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
            onCancelRequest={handleCancelRequest}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No Users Found.</Text>
          }
          contentContainerStyle={{paddingBottom:20}}
          />
        )
      }
    </View>
  )
}

export default DiscoverScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#121212",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 16,
        marginTop: 40,
    },
    searchInput: {
        backgroundColor: "#1e1e1e",
        color: "#fff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#333",
    },
    emptyText: {
        color: "#aaa",
        textAlign: "center",
        marginTop: 20,
    },
});
