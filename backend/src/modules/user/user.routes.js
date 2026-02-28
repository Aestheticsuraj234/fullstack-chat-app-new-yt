import { Router } from "express";
import { requireAuth } from "../../lib/require-auth.js";
import { prisma } from "../../lib/db.js";

export const userRouter = Router();

userRouter.use(requireAuth);

// Get user info by ID
userRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    return res
      .status(400)
      .json({ message: err.message || "Failed to fetch user" });
  }
});

// Get notification counts
userRouter.get("/notifications/counts", async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadMessagesCount = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    const pendingFriendRequestsCount = await prisma.friendRequest.count({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
    });

    return res.json({
      unreadMessages: unreadMessagesCount,
      pendingFriendRequests: pendingFriendRequestsCount,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ message: err.message || "Failed to fetch notification counts" });
  }
});

userRouter.post("/push-token", async (req, res) => {
  try {
    const userId = req.user.id;
    const { pushToken } = req.body;
    if (!pushToken) {
      return res.status(400).json({ message: "Push token is required" });
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        pushToken,
      },
    });

    return res.json({ message: "Push token saved successfully" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to save push token" });
  }
});
