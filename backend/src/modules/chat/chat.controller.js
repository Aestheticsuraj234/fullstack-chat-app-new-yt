import { sendNewMessageNotification } from "../../lib/push-notification.js";
import { isUserOnline } from "../../lib/socket.js";
import { getConversation, getMessages, markMessagesAsRead, sendMessage } from "./chat.service.js";
import { prisma } from "../../lib/db.js";

export async function send(req , res) {
    try {
        const senderId = req.user.id;
        const {receiverId , content} = req.body;

        const result = await sendMessage(senderId , receiverId , content);

      const {io} = await import("../../index.js");

      const conversationId = [senderId , receiverId].sort().join("-");

      io.to(conversationId).emit("new_message" , result)

       io.to(receiverId).emit("notification:new_message", result);
    io.to(senderId).emit("notification:new_message", result);

    if(!isUserOnline(receiverId) && receiverId !== senderId){
        const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { pushToken: true },
      });

      if(receiver?.pushToken){
           const senderName = req.user.name || req.user.username || "Someone";
        const truncatedContent =
          content.length > 50 ? content.substring(0, 50) + "..." : content;

          sendNewMessageNotification(
             receiver.pushToken,
          senderName,
          truncatedContent,
          req.user.avatar || req.user.profilePicture || null,
          senderId
          ).catch((err)=>console.error("Push notification failed" , err))
      }
    }

        return res.json(result);
    } catch (error) {
        return res.status(400).json({message:"Failed to send message"})
    }
}

export async function listMessages(req , res) {
    try {
        const userId = req.user.id;
        const {otherUserId} = req.params;

        const {limit , cursor} = req.query;

        const result = await getMessages(
            userId,
            otherUserId,
            limit ? parseInt(limit) : undefined,
            cursor || undefined
        );

         return res.json(result);
    } catch (error) {
         return res.status(400).json({message:"Failed to fetch messages"})
    }
}

export async function markRead(req , res) {
    try {
        const userId = req.user.id;
        const {senderId}= req.body;

        await markMessagesAsRead(userId , senderId);

        // TODO: websocket

        return res.json({success:true})
    } catch (err) {
        return res
      .status(400)
      .json({ message: err.message || "Failed to mark messages as read" });
    }
}

export async function listConversations(req , res) {
    try {
        const userId = req.user.id;
        const result = await getConversation(userId);

        return res.json(result);
    } catch (err) {
         return res
      .status(400)
      .json({ message: err.message || "Failed to fetch conversations" });
    }
}

