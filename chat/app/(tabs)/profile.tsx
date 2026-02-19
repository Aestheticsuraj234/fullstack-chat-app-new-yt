import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "expo-router";
import { useFriends } from "@/hooks/useFriendQueries";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

interface Friend {
  id: string;
  name: string;
  email: string;
  image?: string;
}


const Profile = () => {
  const queryClient = useQueryClient()
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { data: friends = [], isLoading } = useFriends();

  const handleSignOut = ()=>{
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out?",
      [
        {text:"Cancel" , style:"cancel"},
         {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    )
    queryClient.clear();
  }

  const handleChatWithFriend = (friendId:string)=>{
    router.push(`/chat/${friendId}`)
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Not Logged IN</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{
            uri: `https://api.dicebear.com/9.x/glass/png?seed=${user.id}`,
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{friends.length}</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people" size={20} color="#fff" />
          <Text style={styles.sectionTitle}>Friends</Text>
        </View>

        {
          isLoading ? (
              <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
          ) : friends.length === 0 ? (
            <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>No friends yet</Text>
            <Text style={styles.emptySubText}>Go to Discover to add friends</Text>
          </View>
          ) :(
            friends.map((friend:Friend)=>(
              <TouchableOpacity
              key={friend.id}
              style={styles.friendItem}
              onPress={()=>handleChatWithFriend(friend.id)}
              >
                 <Image
                source={{ uri: `https://api.dicebear.com/9.x/glass/png?seed=${friend.id}` }}
                style={styles.friendAvatar}
              />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendEmail}>{friend.email}</Text>
              </View>
               <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            ))
          )
        }
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}> 
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#1e1e1e",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: "#333",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#888",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#1e1e1e",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 30,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#333",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  friendEmail: {
    fontSize: 12,
    color: "#888",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 30,
    padding: 16,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});
