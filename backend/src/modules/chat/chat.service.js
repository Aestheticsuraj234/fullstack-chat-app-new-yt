import { prisma } from "../../lib/db.js";

function normalizePair(a, b) {
  return a < b ? [a, b] : [b, a];
}

export const sendMessage = async (senderId, receiverId, content) => {
  if (!content) {
    throw new Error("message content cannot be empty");
  }
  if (senderId === receiverId) {
    throw new Error("You cannot send a messages to yourself");
  }

  const [u1, u2] = normalizePair(senderId, receiverId);

  const existingFriend = await prisma.friend.findFirst({
    where: {
      userId1: u1,
      userId2: u2,
    },
  });

  if (!existingFriend) {
    throw new Error("you can only send messages to friends");
  }

  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      content,
    },
  });

  return message;
};

export const getMessages = async (
  userId1,
  userId2,
  limit = 50,
  cursor = null,
) => {
  const where = {
    OR: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  };

  if (cursor) {
    where.AND = {
      createdAt: { lt: new Date(cursor) },
    };
  }

  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });

  const hasMore = messages.length > limit;
  const results = hasMore ? messages.slice(0, limit) : messages;

  return {
    messages: results.reverse(),
    hasMore,
    nextCursor: hasMore
      ? results[results.length - 1].createdAt.toISOString()
      : null,
  };
};

export const markMessagesAsRead = async (userId, senderId) => {
  await prisma.message.updateMany({
    where: {
      senderId,
      receiverId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
};

export async function getConversation(userId) {
  const friendShips = await prisma.friend.findMany({
    where: {
      OR: [
        {
          userId1: userId,
        },
        {
          userId2: userId,
        },
      ],
    },
    include: {
      user1: {
        select: { id: true, name: true, image: true },
      },
      user2: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  const friends = friendShips.map((f) =>
    f.userId1 === userId ? f.user2 : f.user1,
  );

  const friendIds = friends.map((f) => f.id);

  const allMessages = await prisma.message.findMany({
    where: {
      OR: [
        {
          senderId: userId,
          receiverId: {
            in: friendIds,
          },
        },
        { senderId: { in: friendIds }, receiverId: userId },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const lastMessages = new Map();
  const unreadCounts = new Map();

  allMessages.forEach((msg) => {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;

    if (!lastMessages.has(partnerId)) {
      lastMessages.set(partnerId, msg);
    }

    if (
      msg.senderId === partnerId &&
      msg.receiverId === userId &&
      !msg.isRead
    ) {
      unreadCounts.set(partnerId, (unreadCounts.get(partnerId) || 0) + 1);
    }
  });

  const conversations = friends.map((friend) => ({
    ...friend,
    lastMessage: lastMessages.get(friend.id) || null,
    unreadCount: unreadCounts.get(friend.id) || 0,
  }));

  return conversations.sort((a, b) => {
    const timeA = a.lastMessage?.createdAt || new Date(0);
    const timeB = b.lastMessage?.createdAt || new Date(0);
    return timeB - timeA;
  });
}
