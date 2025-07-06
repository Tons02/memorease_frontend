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
          url: `/deceased`,
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["Deceased"],
      }),
      updateDeceased: builder.mutation({
        query: ({ id, formData }) => ({
          url: `/deceased/${id}`,
          method: "POST",
          body: formData,
        }),
        invalidatesTags: ["Deceased"],
      }),
      archivedDeceased: builder.mutation({
        query: ({ id }) => ({
          url: `/deceased-archived/${id}`,
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
