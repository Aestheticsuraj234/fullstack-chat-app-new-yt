import { API_URL } from "@/utils";
import { authClient } from "@/utils/auth-client";


async function getHeaders() {
  const cookie = authClient.getCookie?.() ?? "";
  return {
    "Content-Type": "application/json",
    ...(cookie ? { Cookie: cookie } : {}),
  };
}

export const friendService = {
  getFriends: async () => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/friend/list`, {
      method: "GET",
      headers,
    });

    const data = await res.clone().json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch friends");
    return data;
  },
  discoverUsers: async (search: string = "") => {
    const headers = await getHeaders();
    const url = `${API_URL}/friend/discover?search=${encodeURIComponent(search)}`;

    try {
      const res = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Discover users failed:",
          res.status,
          res.statusText,
          text,
        );
        throw new Error(`Failed to discover users: ${res.status} ${text}`);
      }

      return res.json();
    } catch (error) {
      console.error("Network error in discoverUsers:", error);
      throw error;
    }
  },
  sendFriendRequest: async (receiverId: string) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/friend/request`, {
      method: "POST",
      headers,
      body: JSON.stringify({ receiverId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send request");
    return data;
  },
  acceptFriendRequest:async(requestId:string)=>{
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/friend/request/id/${requestId}/accept`,{
      method:"POST",
      headers
    })
    let data;
    try {
      data = await res.clone().json()
    } catch (error) {
       data = await res.json();
    }

    if(!res.ok) throw new Error(data.message || "Failed to accept request")

      return data;
  },
  rejectFriendRequest:async(requestId:string)=>{
     const headers = await getHeaders();
    const res = await fetch(`${API_URL}/friend/request/id/${requestId}/reject`,{
      method:"POST",
      headers
    })
    let data;
    try {
      data = await res.clone().json()
    } catch (error) {
       data = await res.json();
    }

    if(!res.ok) throw new Error(data.message || "Failed to reject request")

      return data;
  },
  cancelFriendRequest:async(requestId:string)=>{
     const headers = await getHeaders();
    const res = await fetch(`${API_URL}/friend/request/id/${requestId}/cancel`,{
      method:"POST",
      headers
    })

    let data;
    try {
      data = await res.clone().json()
    } catch (error) {
       data = await res.json();
    }

    if(!res.ok) throw new Error(data.message || "Failed to cancel request")

      console.log(data)
      return data;
  }
};
