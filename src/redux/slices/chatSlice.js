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
    }),
  });

export const {
  useGetConversationQuery,
  useGetSpecificMessageQuery,
  useAddConversationMutation,
  useSendMessageMutation,
} = chatSlice;
