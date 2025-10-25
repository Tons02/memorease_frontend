import { apiSlice } from "./apiSlice";

export const apiUser = apiSlice
  .enhanceEndpoints({
    addTagTypes: ["Users"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getUser: builder.query({
        query: (params) => ({
          url: "/user",
          params,
        }),
        method: "GET",
        providesTags: ["Users"],
      }),
      addUser: builder.mutation({
        query: (user) => ({
          url: `/user`,
          method: "POST",
          body: user,
        }),
        invalidatesTags: ["Users"],
      }),
      updateUser: builder.mutation({
        query: (user) => ({
          url: `/user/${user.id}`,
          method: "PATCH",
          body: user,
        }),
        invalidatesTags: ["Users"],
      }),
      resetPassword: builder.mutation({
        query: (user) => ({
          url: `/resetpassword/${user.id}`,
          method: "PATCH",
          body: user,
        }),
        invalidatesTags: ["Users"],
      }),
      archivedUser: builder.mutation({
        query: ({ id }) => ({
          url: `/user-archived/${id}`,
          method: "PUT",
          body: id,
        }),
        invalidatesTags: ["Users"],
      }),
      deleteUser: builder.mutation({
        query: ({ id }) => ({
          url: `/user/${id}`,
          method: "DELETE",
          body: id,
        }),
        invalidatesTags: ["Users"],
      }),
    }),
  });

export const {
  useGetUserQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useResetPasswordMutation,
  useArchivedUserMutation,
  useDeleteUserMutation,
} = apiUser;
