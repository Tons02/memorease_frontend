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
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
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
  useLogoutMutation,
  useChangePasswordMutation,
} = apiSlice;
