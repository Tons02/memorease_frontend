import { apiSlice } from "./apiSlice";

export const apiTerms = apiSlice
  .enhanceEndpoints({
    addTagTypes: ["Terms"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getTerms: builder.query({
        query: (params) => ({
          url: "/terms",
          params,
        }),
        method: "GET",
        providesTags: ["Terms"],
      }),
      addTerms: builder.mutation({
        query: (terms) => ({
          url: `/terms`,
          method: "POST",
          body: terms,
        }),
        invalidatesTags: ["Terms"],
      }),
      updateTerms: builder.mutation({
        query: (terms) => ({
          url: `/terms/${terms.id}`,
          method: "PATCH",
          body: terms,
        }),
        invalidatesTags: ["Terms"],
      }),
      archivedTerms: builder.mutation({
        query: ({ id }) => ({
          url: `/terms-archived/${id}`,
          method: "PUT",
          body: id,
        }),
        invalidatesTags: ["Terms"],
      }),
    }),
  });

export const {
  useGetTermsQuery,
  useAddTermsMutation,
  useUpdateTermsMutation,
  useArchivedTermsMutation,
} = apiTerms;
