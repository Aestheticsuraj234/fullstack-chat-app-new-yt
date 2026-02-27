import { API_URL } from "@/utils";
import { authClient } from "../utils/auth-client";



async function getHeaders() {
    const cookie = authClient.getCookie?.() ?? "";
    return {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
    };
}

export interface UserInfo {
    id: string;
    name: string;
    email: string;
    image?: string;
}

export const userService = {
    getUserInfo: async (userId: string): Promise<UserInfo> => {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/user/${userId}`, {
            method: "GET",
            headers,
        });
        const data = await res.clone().json();
        console.log("User info response:", data);
        if (!res.ok) throw new Error(data.message || "Failed to fetch user info");
        return data;
    },
    getNotificationCounts: async (): Promise<{ unreadMessages: number; pendingFriendRequests: number }> => {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/user/notifications/counts`, {
            method: "GET",
            headers,
        });
        const data = await res.clone().json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch notification counts");
        return data;
    },
};
