import { Router } from "express";
import { requireAuth } from "../../lib/require-auth.js";
import { acceptRequest, cancelRequest, discover, listFriends, rejectRequest, sendRequest } from "./friend.controller.js";


export const friendRouter = Router()

friendRouter.use(requireAuth)

// Send Request

friendRouter.post("/request" , sendRequest);
// List friends
friendRouter.get("/list" , listFriends);
// discover
friendRouter.get("/discover" , discover)


friendRouter.post("/request/id/:requestId/accept" , acceptRequest)

friendRouter.post("/request/id/:requestId/reject" , rejectRequest)

friendRouter.post("/request/id/:requestId/cancel" , cancelRequest)