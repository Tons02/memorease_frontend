import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_MEMOREASEBACKEND_ENDPOINT, // Corrected base URL
    prepareHeaders: (headers) => {
      // Add the authorization token from localStorage (if it exists)
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Accept", "application/json"); // JSON content type
      return headers;
    },
  }),
  tagTypes: ["Roles", "Users"],
  endpoints: (builder) => ({
    // Login endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: `/login`,
        method: "POST",
        body: credentials,
      }),
    }),
    registration: builder.mutation({
      query: (body) => ({
        url: `/registration`,
        method: "POST",
        body: body,
      }),
    }),
    verifyEmail: builder.query({
      query: ({ id, hash, expires, signature }) =>
        `/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`,
    }),
    resendVerification: builder.mutation({
      query: () => ({
        url: "/email/verification-notification",
        method: "POST",
      }),
    }),
    getRole: builder.query({
      query: ({ search, page, per_page, status }) =>
        `/role?search=${search}&page=${page}&per_page=${per_page}&status=${status}`,
      method: "GET",
      providesTags: ["Roles"],
    }),
    GetRoleDropDown: builder.query({
      query: () => `/role?pagination=none`,
      method: "GET",
      providesTags: ["DropdownRegion"],
    }),
    addRole: builder.mutation({
      query: (role) => ({
        url: `/role`,
        method: "POST",
        body: role,
      }),
      invalidatesTags: ["Roles"],
    }),
    updateRole: builder.mutation({
      query: (role) => ({
        url: `/role/${role.id}`,
        method: "PATCH",
        body: role,
      }),
      invalidatesTags: ["Roles"],
    }),
    archivedRole: builder.mutation({
      query: ({ id }) => ({
        url: `/role-archived/${id}`,
        method: "PUT",
        body: id,
      }),
      invalidatesTags: ["Roles"],
    }),
    getUser: builder.query({
      query: ({ search, page, per_page, status }) =>
        `/user?search=${search}&page=${page}&per_page=${per_page}&status=${status}`,
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
    archivedUser: builder.mutation({
      query: ({ id }) => ({
        url: `/user-archived/${id}`,
        method: "PUT",
        body: id,
      }),
      invalidatesTags: ["Users"],
    }),
    getCemetery: builder.query({
      query: () => `/cemeteries?status=active&pagination=none`,
      method: "GET",
      providesTags: ["Cemetery"],
    }),
    getLot: builder.query({
      query: ({ search }) =>
        `/lot?search=${search}&status=active&pagination=none`,
      method: "GET",
      providesTags: ["Lot"],
    }),
    addLot: builder.mutation({
      query: (lot) => ({
        url: `/lot`,
        method: "POST",
        body: lot,
      }),
      invalidatesTags: ["Lots"],
    }),
    updateLot: builder.mutation({
      query: (lot) => ({
        url: `/lot/${lot.id}`,
        method: "PATCH",
        body: lot,
      }),
      invalidatesTags: ["Lots"],
    }),
    archivedLot: builder.mutation({
      query: ({ id }) => ({
        url: `/lot-archived/${id}`,
        method: "PUT",
        body: id,
      }),
      invalidatesTags: ["Lots"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
    changePassword: builder.mutation({
      query: (body) => ({
        url: `/changepassword`,
        method: "PATCH",
        body: body,
      }),
    }),
  }),
});

// Export the generated hooks
export const {
  useLoginMutation,
  useRegistrationMutation,
  useVerifyEmailQuery,
  useResendVerificationMutation,
  useGetRoleQuery,
  useLazyGetRoleDropDownQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
  useArchivedRoleMutation,
  useGetUserQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useArchivedUserMutation,
  useGetCemeteryQuery,
  useGetLotQuery,
  useUpdateLotMutation,
  useArchivedLotMutation,
  useAddLotMutation,
  useLogoutMutation,
  useChangePasswordMutation,
} = apiSlice;
