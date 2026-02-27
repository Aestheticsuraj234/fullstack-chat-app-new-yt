import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { ChatUser } from "@/services/chat.service";
import { Colors } from "@/constants/colors";
import { useRouter } from "expo-router";

interface ChatListItemProps {
  user: ChatUser;
}

const ChatListItem = ({ user }: ChatListItemProps) => {
    const router = useRouter();

    const lastMessageTime = user.lastMessage ? new Date(user.lastMessage.createdAt).toLocaleTimeString([] , {
        hour:"2-digit",
        minute:"2-digit"
    })
    : ""

    const handlePress = ()=>{
        router.push(`/chat/${user.id}`)
    }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image
        source={{
          uri: `https://api.dicebear.com/9.x/glass/png?seed=${user.id}`,
        }}
        style={styles.avatar}
      />

      <View style={styles.content}>
        <View style={styles.header}>
            <Text style={[styles.name , (user.unreadCount || 0)>0 ? styles.nameUnread :undefined]}>{user.name}</Text>
             <Text style={[styles.time , (user.unreadCount || 0)>0 ? styles.timeUnread :undefined]}>{lastMessageTime}</Text>
        </View>
        <View style={styles.messageRow}>
            <Text style={styles.message}>
                {user.lastMessage ? user.lastMessage.content : "Tap to start chatting"}
            </Text>

            {
                user.unreadCount && user.unreadCount > 0 ? (
                    <View style={styles.badge}>
                        <Text>
                            {user.unreadCount > 99 ? "99+" : user.unreadCount}
                        </Text>
                    </View>
                ) : (
                    null
                )
            }
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    backgroundColor: "#121212", // Dark theme background matching app
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    backgroundColor: Colors.primary || "#007AFF",
    borderRadius: 10,
    height: 20,
    minWidth: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#333",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  time: {
    fontSize: 12,
    color: "#888",
  },
  message: {
    fontSize: 14,
    color: "#aaa",
    flex: 1,
  },
  nameUnread: {
    fontWeight: "800",
    color: "#fff",
  },
  timeUnread: {
    color: Colors.primary || "#007AFF",
    fontWeight: "600",
  },
  messageUnread: {
    color: "#fff",
    fontWeight: "600",
  },
});
