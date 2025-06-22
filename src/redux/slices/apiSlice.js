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
  tagTypes: ["Roles"],
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
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
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
  useAddRoleMutation,
  useUpdateRoleMutation,
  useArchivedRoleMutation,
  useLogoutMutation,
} = apiSlice;
