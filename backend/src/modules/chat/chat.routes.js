import {Router} from "express";
import {requireAuth} from "../../lib/require-auth.js";
import { listConversations, listMessages, markRead, send } from "./chat.controller.js";

export const chatRouter = Router();

chatRouter.use(requireAuth);

chatRouter.post("/send" ,send)
chatRouter.post("/mark-read" , markRead)
chatRouter.get("/messages/:otherUserId" , listMessages)
chatRouter.get("/conversations",listConversations)