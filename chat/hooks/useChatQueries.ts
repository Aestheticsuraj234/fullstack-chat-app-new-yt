import { chatService } from "@/services/chat.service";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

export const CHAT_KEYS = {
  all: ["chats"] as const,
  conversations: () => [...CHAT_KEYS.all, "conversations"] as const,
  messages: (userId: string) => [...CHAT_KEYS.all, "messages", userId] as const,
};

export function useConversation() {
  return useQuery({
    queryKey: CHAT_KEYS.conversations(),
    queryFn: () => chatService.getConversations(),
    staleTime: 1000 * 30,
  });
}

export function useMessages(otherUserId: string) {
  return useQuery({
    queryKey: CHAT_KEYS.messages(otherUserId),
    queryFn: () => chatService.getMessages(otherUserId),
    enabled: !!otherUserId,
    staleTime: 1000 * 60,
  });
}
export function useInfiniteMessages(otherUserId: string) {
  return useInfiniteQuery({
    queryKey: CHAT_KEYS.messages(otherUserId),
    queryFn: ({ pageParam }) =>
      chatService.getMessages(otherUserId, 50, pageParam),
    enabled: !!otherUserId,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    staleTime: 1000 * 60,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      // Flatten all messages from all pages
      messages: data.pages.flatMap((page) => page.messages),
    }),
  });
}


export function useSendMessage(){
     return useMutation({
        mutationFn: ({ receiverId, content }: { receiverId: string; content: string }) =>
            chatService.sendMessage(receiverId, content),
    });
}