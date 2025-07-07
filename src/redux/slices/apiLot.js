import { apiSlice } from "./apiSlice";

export const apiLot = apiSlice
  .enhanceEndpoints({
    addTagTypes: ["Lots"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getLot: builder.query({
        query: (params) => ({
          url: "/lot",
          params,
        }),
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
        query: ({ id, lot }) => ({
          url: `/lot/${id}`,
          method: "POST",
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
    }),
  });

export const {
  useGetLotQuery,
  useUpdateLotMutation,
  useArchivedLotMutation,
  useAddLotMutation,
} = apiLot;
