import { NotificationBanner, NotificationData } from "@/components/NotificationBanner";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { SocketProvider } from "@/contexts/socket-context";
import { notificationService, setupAndroidNotificationChannels, setupNotificationCategories } from "@/services/notification.service";
import { queryClient } from "@/utils/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

export default function RootLayout(){
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
      <Layout/>
      </SocketProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

 function Layout() {
  const {user , isLoading} = useAuth();
  const isLoggedIn = !!user;
  const notificationListener = useRef<(() => void) | null>(null);
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);
const router = useRouter()
  useEffect(()=>{
    setupNotificationCategories(),
    setupAndroidNotificationChannels()
  },[])

  useEffect(()=>{
    if(!isLoggedIn) return;

    notificationService.registerForPushNotifications();

    notificationListener.current = notificationService.setupNotificationListeners(
    (notification)=>{
        const { title, body, subtitle, data } = notification.request.content;


        setCurrentNotification({
           title: title || 'New Notification',
          body: body || '',
          subtitle: subtitle || undefined,
          imageUrl: data?.imageUrl as string | undefined,
          type: data?.type as 'friend_request' | 'new_message' | 'default',
          data: data,
        })
    },
    (response)=>{
       const data = response.notification.request.content.data;

        if (data.type === "friend_request") {
          // Navigate to discover/requests screen
          router.push("/(tabs)/discover");
        } else if (data.type === "new_message" && data.senderId) {
          // Navigate to chat screen
          router.push(`/chat/${data.senderId}`);
        }
    },
    (actionIdentifier, notification, userText) => {
        // Handle notification actions (accept/reject/reply)
        notificationService.handleNotificationAction(actionIdentifier, notification, userText);
      }
    )

    return ()=>{
      notificationListener.current?.()
    }
  },[isLoggedIn , router])

  if(isLoading) return null;

   const handleBannerPress = () => {
    if (!currentNotification?.data) return;

    const data = currentNotification.data;

    if (data.type === "friend_request") {
      router.push("/(tabs)/discover");
    } else if (data.type === "new_message" && data.senderId) {
      router.push(`/chat/${data.senderId}`);
    }

    setCurrentNotification(null);
  };

  const handleBannerDismiss = () => {
    setCurrentNotification(null);
  };

  return (
    <>
      <NotificationBanner
        notification={currentNotification}
        onPress={handleBannerPress}
        onDismiss={handleBannerDismiss}
      />
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
         <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
    </>
  );
}
