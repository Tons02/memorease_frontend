import { apiSlice } from "./apiSlice";

export const apiCemetery = apiSlice
  .enhanceEndpoints({
    addTagTypes: ["Cemetery"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getCemetery: builder.query({
        query: () => `/cemeteries?status=active&pagination=none`,
        method: "GET",
        providesTags: ["Cemetery"],
      }),
      updateCemetery: builder.mutation({
        query: ({ id, formData }) => ({
          url: `/cemeteries/${id}`,
          method: "POST",
          body: formData,
        }),
        invalidatesTags: ["Cemetery"],
      }),
    }),
  });

export const { useGetCemeteryQuery, useUpdateCemeteryMutation } = apiCemetery;
