import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useFocusEffect } from "expo-router";
import { authClient } from "@/utils/auth-client";
import { useAuth } from "@/contexts/auth-context";
import { CHAT_KEYS, useConversation } from "@/hooks/useChatQueries";
import ChatListItem from "@/components/ChatListItem";
import { useSocket } from "@/contexts/socket-context";
import { useQueryClient } from "@tanstack/react-query";
import { ChatUser } from "@/services/chat.service";

const HomeScreen = () => {
  const { data: conversations = [], isLoading, refetch } = useConversation();
  const [refreshing, setRefreshing] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      queryClient.setQueryData<ChatUser[]>(
        CHAT_KEYS.conversations(),
        (prev = []) => {
          const otherUserId =
            message.senderId === user?.id
              ? message.receiverId
              : message.senderId;
          const existingIndex = prev.findIndex((c) => c.id === otherUserId);

          let newConversations = [...prev];
          let updatedConversation: ChatUser;

          if (existingIndex !== -1) {
            updatedConversation = {
              ...newConversations[existingIndex],
              lastMessage: message,
              unreadCount:
                (newConversations[existingIndex].unreadCount || 0) + 1,
            };
            // Remove from current position
            newConversations.splice(existingIndex, 1);
          } else {
            // New conversation, refetch to get full user details
            queryClient.invalidateQueries({
              queryKey: CHAT_KEYS.conversations(),
            });
            return prev;
          }

          // Add to top
          newConversations.unshift(updatedConversation);
          return newConversations;
        },
      );
    };

    const handleMessagesRead = ({
      conversationId,
    }: {
      conversationId: string;
    }) => {
      queryClient.setQueryData<ChatUser[]>(
        CHAT_KEYS.conversations(),
        (prev = []) => {
          return prev.map((c) => {
            if (c.id === conversationId) {
              return { ...c, unreadCount: 0 };
            }
            return c;
          });
        },
      );
    };

    socket.on("notification:new_message", handleNewMessage);
    socket.on("notification:messages_read", handleMessagesRead);

    return () => {
      socket.off("notification:new_message", handleNewMessage);
      socket.off("notification:messages_read", handleMessagesRead);
    };
  }, [socket, user]);

  if (isLoading && !conversations.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={"large"} color={"#0074ff"} />
      </View>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chats</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatListItem user={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={"#fff"}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Chats Yet.</Text>
            <Text style={styles.emptySubText}>
              Go to Discover to find friends!
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default HomeScreen;

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
