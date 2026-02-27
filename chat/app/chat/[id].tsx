import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { chatService, Message } from "@/services/chat.service";
import { Ionicons } from "@expo/vector-icons";
import { userService } from "@/services/user.service";
import { useSocket } from "@/contexts/socket-context";

interface User {
  id: string;
  name: string;
  email: string;
}

const ChatScreen = () => {
  const insets = useSafeAreaInsets();
  const { id: otherUserId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  console.log(otherUserId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [inputText, setInputText] = useState("");
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { socket, setUnreadMessages, setPendingFriendRequests } = useSocket();

  useEffect(() => {
    if (!otherUserId) return;

    const loadData = async () => {
      try {
        setIsLoading(true);

        const [messagesData, userData] = await Promise.all([
          chatService.getMessages(otherUserId),
          userService.getUserInfo(otherUserId),
        ]);

        console.log("Messages data:", messagesData);
        console.log("User data:", userData);

        setMessages(messagesData.messages || []);
        setOtherUser(userData);
      } catch (error) {
        console.error("Failed to load chat data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [otherUserId]);

  useEffect(() => {
    if (!socket || !user || !otherUserId) return;

    const conversationId = [user.id, otherUserId].sort().join("-");
    socket.emit("join", conversationId);

    socket.emit(
      "check_online",
      otherUserId,
      (response: { userId: string; isOnline: boolean }) => {
        setIsOtherUserOnline(response.isOnline);
      },
    );

    const onUserOnline = (data: { userId: string }) => {
      if (data.userId === otherUserId) {
        setIsOtherUserOnline(true);
      }
    };

    const onUserOffline = (data: { userId: string }) => {
      if (data.userId === otherUserId) {
        setIsOtherUserOnline(false);
      }
    };

    const onUserTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === otherUserId) {
        setIsOtherUserTyping(data.isTyping);
      }
    };

    const onNewMessage = (message: Message) => {
      setMessages((prev) => {
       
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;

       
        return [...prev, message];
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    socket.on("new_message", onNewMessage);
    socket.on("user_online", onUserOnline);
    socket.on("user_typing", onUserTyping);
    socket.on("user_offline", onUserOffline);

    return () => {
      socket.emit("leave", conversationId);
      socket.off("new_message", onNewMessage);
      socket.off("user_online", onUserOnline);
      socket.off("user_typing", onUserTyping);
      socket.off("user_offline", onUserOffline);
    };
  }, [socket, user, otherUserId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1e1e1e" />
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const handleSend = async () => {
    if (!inputText || !otherUserId || isSending) return;

    const messageText = inputText.trim();
    setInputText("");
    setIsSending(true);

    if (socket && user) {
      const conversationId = [user.id, otherUserId].sort().join("-");
      socket.emit("typing", { conversationId, isTyping: false });
    }

    try {
      const newMessage = await chatService.sendMessage(
        otherUserId,
        messageText,
      );
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputText(messageText); // Restore text on error
    } finally {
      setIsSending(false);
    }
  };

  const handleTextChange = (text: string) => {
    setInputText(text);

    if (!socket || !user) return;

    const conversationId = [user.id, otherUserId].sort().join("-");

    if (text.trim()) {
      socket.emit("typing", { conversationId, isTyping: true });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", { conversationId, isTyping: false });
      }, 1000);
    } else {
      socket.emit("typing", { conversationId, isTyping: false });
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage
            ? styles.myMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[styles.messageText, isMyMessage && styles.myMessageText]}
          >
            {item.content}
          </Text>
          <Text
            style={[styles.messageTime, isMyMessage && styles.myMessageTime]}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e1e1e" />
      <Stack.Screen
        options={{
          headerShown: true,

          headerStyle: { backgroundColor: "#1e1e1e" },
          headerTintColor: "#fff",
          headerBackTitle: "Back",
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <Image
                source={{
                  uri: `https://api.dicebear.com/9.x/glass/png?seed=${otherUserId}`,
                }}
                style={styles.headerAvatar}
              />
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerName} numberOfLines={1}>
                  {otherUser?.name || "Loading..."}
                </Text>
                {isOtherUserTyping ? (
                  <Text style={styles.headerStatus}>typing...</Text>
                ) : isOtherUserOnline ? (
                  <Text style={styles.headerStatusOnline}>online</Text>
                ) : (
                  <Text style={styles.headerStatus}>offline</Text>
                )}
              </View>
            </View>
          ),
        }}
      />
      <SafeAreaView style={styles.wrapper} edges={["bottom"]}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={"padding"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 85}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#666" />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubText}>Start the conversation!</Text>
              </View>
            }
          />

          <View
            style={[
              styles.inputContainer,
              { paddingBottom: Math.max(insets.bottom, 10) },
            ]}
          >
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={handleTextChange}
                placeholder="Type a message..."
                placeholderTextColor="#888"
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText || isSending) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size={"small"} color={"#fff"} />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#333",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  headerStatus: {
    fontSize: 12,
    color: "#888",
  },
  headerStatusOnline: {
    fontSize: 12,
    color: "#4CAF50",
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: "row",
  },
  myMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: "#2C2C2E",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 4,
  },
  myMessageText: {
    color: "#fff",
  },
  messageTime: {
    fontSize: 11,
    color: "#ddd",
  },
  myMessageTime: {
    color: "#E5E5E7",
  },
  inputContainer: {
    backgroundColor: "#1e1e1e",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: "#fff",
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
