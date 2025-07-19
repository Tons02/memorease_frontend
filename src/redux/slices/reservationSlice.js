import { apiSlice } from "./apiSlice";

export const apiReservation = apiSlice
  .enhanceEndpoints({
    addTagTypes: ["Reservation", "Lots"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getReservation: builder.query({
        query: (params) => ({
          url: "/reservation",
          params,
        }),
        method: "GET",
        providesTags: ["Reservation"],
      }),
      addReservation: builder.mutation({
        query: (body) => ({
          url: `/reservation`,
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["Reservation", "Lots"],
      }),
      updateReservation: builder.mutation({
        query: ({ id, formData }) => ({
          url: `/reservation/${id}`,
          method: "PATCH",
          body: formData,
        }),
        invalidatesTags: ["Reservation"],
      }),
      cancelReservation: builder.mutation({
        query: ({ id }) => ({
          url: `/reservation-cancel/${id}`,
          method: "PATCH",
        }),
        invalidatesTags: ["Reservation"],
      }),
      approveReservation: builder.mutation({
        query: ({ id }) => ({
          url: `/reservation-approve/${id}`,
          method: "PATCH",
        }),
        invalidatesTags: ["Reservation"],
      }),
      rejectReservation: builder.mutation({
        query: ({ id, body }) => ({
          url: `/reservation-reject/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["Reservation"],
      }),
      archivedReservation: builder.mutation({
        query: ({ id }) => ({
          url: `/reservation-archived/${id}`,
          method: "PUT",
          body: id,
        }),
        invalidatesTags: ["Reservation"],
      }),
    }),
  });

export const {
  useGetReservationQuery,
  useAddReservationMutation,
  useApproveReservationMutation,
  useCancelReservationMutation,
  useRejectReservationMutation,
  useUpdateReservationMutation,
  useArchivedReservationMutation,
} = apiReservation;
