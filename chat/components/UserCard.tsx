import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  relationship?: "NONE" | "FRIEND" | "REQUEST_SENT" | "REQUEST_RECEIVED";
  friendRequestId?: string;
}

interface UserCardProps {
  user: User;
  onSendRequest: (userId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onCancelRequest: (requestId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onSendRequest,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
}) => {
  const renderActionButton = () => {
    switch (user.relationship) {
      case "FRIEND":
        return (
          <View style={styles.friendBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.friendText}>Friend</Text>
          </View>
        );
      case "REQUEST_SENT":
        return (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() =>
              user.friendRequestId && onCancelRequest(user.friendRequestId)
            }
          >
            <Text style={styles.buttonText}>Cancel Request</Text>
          </TouchableOpacity>
        );
      case "REQUEST_RECEIVED":
        return (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() =>
                user.friendRequestId && onAcceptRequest(user.friendRequestId)
              }
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() =>
                user.friendRequestId && onRejectRequest(user.friendRequestId)
              }
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <TouchableOpacity
            style={[styles.button, styles.sendButton]}
            onPress={() => onSendRequest(user.id)}
          >
            <Text style={styles.buttonText}>Add Friend</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={styles.card}>
      <Image
        source={{
          uri: `https://api.dicebear.com/9.x/glass/png?seed=${user.id}`,
        }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      <View style={styles.actions}>{renderActionButton()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  email: {
    color: "#aaa",
    fontSize: 12,
  },
  actions: {
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    backgroundColor: "#007AFF",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#FF3B30",
  },
  cancelButton: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  friendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 20,
  },
  friendText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "600",
  },
});
