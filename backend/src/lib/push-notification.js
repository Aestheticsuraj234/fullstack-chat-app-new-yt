import {Expo} from "expo-server-sdk";

const expo = new Expo();


export async function sendPushNotification(pushToken, title, body, data = {}) {
     if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
        return;
    }

     const message = {
        to: pushToken,
        sound: data.sound || "default",
        title,
        body,
        data,
        priority: data.priority || "high",
        badge: data.badge,
        categoryIdentifier: data.categoryId,

        channelId: data.channelId || 'default',

        subtitle: data.subtitle,
    };

    try {
        const ticketChunk = await expo.sendPushNotificationsAsync([message]);

          if (ticketChunk[0]?.status === 'error') {
            console.error('Push notification error:', ticketChunk[0].message);
        }

         return ticketChunk;
    } catch (error) {
        console.error("Error sending push notification:", error);
    }

}

export async function sendBatchPushNotifications(messages) {
    const validMessages = messages.filter((msg) => Expo.isExpoPushToken(msg.to));

    if (validMessages.length === 0) {
        console.log("No valid push tokens to send to");
        return;
    }

    const chunks = expo.chunkPushNotifications(validMessages);
    const tickets = [];

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error("Error sending batch push notifications:", error);
        }
    }

    return tickets;
}


export async function sendFriendRequestNotification(pushToken, senderName, senderAvatar, requestId) {
    return sendPushNotification(
        pushToken,
        'New Friend Request',
        `${senderName} wants to be your friend`,
        {
            type: 'friend_request',
            categoryId: 'friend_request',
            imageUrl: senderAvatar,
            subtitle: 'FRIEND REQUEST',
            requestId: requestId,
            sound: 'default',
            priority: 'high',
        }
    );
}


export async function sendNewMessageNotification(pushToken, senderName, messageContent, senderAvatar, senderId) {
    return sendPushNotification(
        pushToken,
        senderName,
        messageContent,
        {
            type: 'new_message',
            categoryId: 'new_message',
            imageUrl: senderAvatar,
            subtitle: 'NEW MESSAGE',
            senderId: senderId,
            sound: 'default',
            priority: 'high',
        }
    );
}