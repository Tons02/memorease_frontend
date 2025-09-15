import { apiSlice } from "./apiSlice";

export const chatSlice = apiSlice
  .enhanceEndpoints({
    addTagTypes: ["Conversation"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getConversation: builder.query({
        query: (params) => ({
          url: "/conversations",
          params,
        }),
        method: "GET",
        providesTags: ["Conversation"],
      }),
      getConversationCounts: builder.query({
        query: () => ({
          url: "/get-conversations-counts",
        }),
        method: "GET",
        providesTags: ["Conversation"],
      }),
      getSpecificMessage: builder.query({
        query: (params) => ({
          url: `/conversations/${params.id}/messages`,
          params,
        }),
        method: "GET",
        providesTags: ["Conversation"],
      }),
      addConversation: builder.mutation({
        query: (body) => ({
          url: `/conversations/start`,
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["Conversation"],
      }),
      sendMessage: builder.mutation({
        query: ({ body }) => ({
          url: `/messages/send`,
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["Conversation"],
      }),
      ReceivedMessageCount: builder.mutation({
        query: ({ params }) => ({
          url: `/update-message-status/${params.id}`,
          method: "PATCH",
        }),
        invalidatesTags: ["Conversation"],
      }),
    }),
  });

export const {
  useGetConversationQuery,
  useGetConversationCountsQuery,
  useGetSpecificMessageQuery,
  useAddConversationMutation,
  useSendMessageMutation,
  useReceivedMessageCountMutation,
} = chatSlice;
