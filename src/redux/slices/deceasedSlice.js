import { apiSlice } from "./apiSlice";

export const apiDeceased = apiSlice
  .enhanceEndpoints({
    addTagTypes: ["Deceased"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getDeceased: builder.query({
        query: (params) => ({
          url: "/deceased",
          params,
        }),
        method: "GET",
        providesTags: ["Deceased"],
      }),
      addDeceased: builder.mutation({
        query: (body) => ({
          url: `/role`,
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["Deceased"],
      }),
      updateDeceased: builder.mutation({
        query: (body) => ({
          url: `/deceased/${body.id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["Deceased"],
      }),
      archivedDeceased: builder.mutation({
        query: ({ id }) => ({
          url: `/role-archived/${id}`,
          method: "PUT",
          body: id,
        }),
        invalidatesTags: ["Deceased"],
      }),
    }),
  });

export const {
  useGetDeceasedQuery,
  useAddDeceasedMutation,
  useUpdateDeceasedMutation,
  useArchivedDeceasedMutation,
} = apiDeceased;
