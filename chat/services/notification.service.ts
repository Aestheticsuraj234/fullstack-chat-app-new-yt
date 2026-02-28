import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { authClient } from "@/utils/auth-client";
import { API_URL } from "@/utils";

const NOTIFCATION_CATEGORIES = {
  FRIEND_REQUEST: "friend_request",
  NEW_MESSAGE: "new_message",
};

export const setupNotificationCategories = async () => {
  await Notifications.setNotificationCategoryAsync(
    NOTIFCATION_CATEGORIES.FRIEND_REQUEST,
    [
      {
        identifier: "accept",
        buttonTitle: "Accept",
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: "reject",
        buttonTitle: "Reject",
        options: {
          opensAppToForeground: false,
          isDestructive: true,
        },
      },
    ],
    {
      previewPlaceholder: "Friend Request",
      intentIdentifiers: [],
      categorySummaryFormat: "%u% friend requests",
    },
  );

  await Notifications.setNotificationCategoryAsync(
    NOTIFCATION_CATEGORIES.NEW_MESSAGE,
    [
      {
        identifier: "reply",
        buttonTitle: "Reply",
        options: {
          opensAppToForeground: true,
        },
        textInput: {
          submitButtonTitle: "Send",
          placeholder: "Type a message...",
        },
      },
    ],
    {
      previewPlaceholder: "New Message",
      intentIdentifiers: [],
    },
  );
};

export const setupAndroidNotificationChannels = async () => {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#007aff",
    sound: "default",
  });

  await Notifications.setNotificationChannelAsync("friend_requests", {
    name: "Friend Request",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#007aff",
    sound: "default",
    description: "Notifications for new Friend Request",
  });

  await Notifications.setNotificationChannelAsync("messages", {
    name: "Messages",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#007aff",
    sound: "default",
    description: "Notifications for new messages",
  });
};

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;

    return {
      shouldShowAlert: false,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: false,
      shouldShowList: true,
    };
  },
});

export const notificationService = {
  registerForPushNotifications: async () => {
    try {
      if (!Device.isDevice) {
        console.log("Push notifications only work on physical devices");
        return null;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Permission not granted for push notifications");
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      const token = tokenData.data;

      await notificationService.savePushToken(token);

      return token;
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return null;
    }
  },
  savePushToken: async (token: string) => {
    try {
      const cookie = authClient.getCookie() ?? "";
      const response = await fetch(`${API_URL}/user/push-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: JSON.stringify({ pushToken: token }),
      });
      if (!response.ok) {
        throw new Error("Failed to save push token");
      }
    } catch (error) {
      console.error("Error saving push token:", error);
    }
  },
  setupNotificationListeners: (
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (
      response: Notifications.NotificationResponse,
    ) => void,
    onActionResponse?: (
      actionIdentifier: string,
      notification: Notifications.Notification,
      userText?: string,
    ) => void,
  ) => {
    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        onNotificationReceived?.(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const actionIdentifier = response.actionIdentifier;
        const notification = response.notification;

        if (actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
          // Handle action responses
          const userText = response.userText;
          onActionResponse?.(actionIdentifier, notification, userText);
        } else {
          // Handle regular notification tap
          onNotificationResponse?.(response);
        }
      });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  },

  handleNotificationAction: async (
    actionIdentifier: string,
    notification: Notifications.Notification,
    userText?: string,
  ) => {
    const data = notification.request.content.data;

    try {
      const cookie = authClient.getCookie() ?? "";

      switch (actionIdentifier) {
        case "accept":
          if (data.requestId) {
            await fetch(`${API_URL}/friends/accept/${data.requestId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(cookie ? { Cookie: cookie } : {}),
              },
            });
          }
          break;
        case "reject":
          // Reject friend request
          if (data.requestId) {
            await fetch(`${API_URL}/friends/reject/${data.requestId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(cookie ? { Cookie: cookie } : {}),
              },
            });
          }
          break;
        case "reply":
          // Send quick reply to message
          if (data.senderId && userText) {
            await fetch(`${API_URL}/messages`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(cookie ? { Cookie: cookie } : {}),
              },
              body: JSON.stringify({
                receiverId: data.senderId,
                content: userText,
              }),
            });
          }
          break;
      }
    } catch (error) {
          console.error('Error handling notification action:', error);
    }
  },
};
