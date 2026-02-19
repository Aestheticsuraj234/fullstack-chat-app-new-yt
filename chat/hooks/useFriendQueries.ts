import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { friendService } from "../services/friend.service";

export const USER_KEYS = {
  all: ["users"] as const,
  discover: (search: string) => [...USER_KEYS.all, "discover", search] as const,
  friends: () => [...USER_KEYS.all, "friends"] as const,
};

export function useDiscoverUsers(search: string) {
  return useQuery({
    queryKey: USER_KEYS.discover(search),
    queryFn: () => friendService.discoverUsers(search),
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (receiverId: string) => friendService.sendFriendRequest(receiverId),
    onMutate: async (receiverId) => {
      await queryClient.cancelQueries({ queryKey: USER_KEYS.all });
      const previousUsers = queryClient.getQueriesData({ queryKey: USER_KEYS.all });

      queryClient.setQueriesData({ queryKey: USER_KEYS.all }, (old: any[]) => {
        if (!old) return [];
        return old.map((user) =>
          user.id === receiverId ? { ...user, relationship: "REQUEST_SENT" } : user
        );
      });

      return { previousUsers };
    },
    onError: (err, _, context) => {
      context?.previousUsers.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: (data, receiverId) => {
      console.log(data , receiverId)
  // First patch with real friendRequestId
  queryClient.setQueriesData({ queryKey: USER_KEYS.all }, (old: any[]) => {
    if (!old) return [];
    return old.map((user) =>
      user.id === receiverId
        ? {
            ...user,
            relationship: "REQUEST_SENT",
            friendRequestId: data.id ?? data.friendRequestId ?? data.requestId,
          }
        : user
    );
  });
  // Then invalidate AFTER patch so refetch overwrites with correct server data
  queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
},
  });
}

export function useFriends() {
  return useQuery({
    queryKey: USER_KEYS.friends(),
    queryFn: () => friendService.getFriends(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => friendService.acceptFriendRequest(requestId),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: USER_KEYS.all });
      const previousUsers = queryClient.getQueriesData({ queryKey: USER_KEYS.all });

      queryClient.setQueriesData({ queryKey: USER_KEYS.all }, (old: any[]) => {
        if (!old) return [];
        return old.map((user) =>
          user.friendRequestId === requestId ? { ...user, relationship: "FRIEND" } : user
        );
      });

      return { previousUsers };
    },
    onError: (err, _, context) => {
      context?.previousUsers.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => friendService.rejectFriendRequest(requestId),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: USER_KEYS.all });
      const previousUsers = queryClient.getQueriesData({ queryKey: USER_KEYS.all });

      queryClient.setQueriesData({ queryKey: USER_KEYS.all }, (old: any[]) => {
        if (!old) return [];
        return old.map((user) =>
          user.friendRequestId === requestId
            ? { ...user, relationship: "NONE", friendRequestId: null }
            : user
        );
      });

      return { previousUsers };
    },
    onError: (err, _, context) => {
      context?.previousUsers.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

export function useCancelFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => friendService.cancelFriendRequest(requestId),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: USER_KEYS.all });
      const previousUsers = queryClient.getQueriesData({ queryKey: USER_KEYS.all });

      queryClient.setQueriesData({ queryKey: USER_KEYS.all }, (old: any[]) => {
        if (!old) return [];
        return old.map((user) =>
          user.friendRequestId === requestId
            ? { ...user, relationship: "NONE", friendRequestId: null }
            : user
        );
      });

      return { previousUsers };
    },
    onError: (err, _, context) => {
      console.log(err)
      context?.previousUsers.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}