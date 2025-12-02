import { apiSlice } from "./apiSlice";

export const apiReservation = apiSlice
  .enhanceEndpoints({
    addTagTypes: [
      "Reservation",
      "Lots",
      "AuditTrail",
      "Deceased",
      "ActivityLog",
    ],
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
      getReservationCounts: builder.query({
        query: (params) => ({
          url: "/reservation-status-counts",
          params,
        }),
        method: "GET",
        providesTags: ["Reservation"],
      }),
      getReservationSales: builder.query({
        query: (params) => ({
          url: "/reservation-sales",
          params,
        }),
        method: "GET",
        providesTags: ["Reservation"],
      }),
      getReservationExport: builder.query({
        query: (params) => ({
          url: "/reservation-exports",
          params,
          responseHandler: (response) => response.blob(),
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
      walkInReservation: builder.mutation({
        query: (body) => ({
          url: `/reservation-walk-in`,
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
        query: ({ id, body }) => ({
          url: `/reservation-cancel/${id}`,
          method: "PATCH",
          body: body,
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
      getAuditTrail: builder.query({
        query: (params) => ({
          url: "/audit_trail",
          params,
        }),
        method: "GET",
        invalidatesTags: ["AuditTrail", "Deceased"],
      }),
      getActivityLog: builder.query({
        query: (params) => ({
          url: "/activity_logs",
          params,
        }),
        method: "GET",
        invalidatesTags: ["AuditTrail", "Deceased", "ActivityLog"],
      }),
      transferLot: builder.mutation({
        query: ({ id, body }) => ({
          url: `/transfer_lot/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["AuditTrail", "Deceased"],
      }),
    }),
  });

export const {
  useGetReservationQuery,
  useGetAuditTrailQuery,
  useGetReservationCountsQuery,
  useGetActivityLogQuery,
  useGetReservationSalesQuery,
  useLazyGetReservationExportQuery,
  useAddReservationMutation,
  useWalkInReservationMutation,
  useApproveReservationMutation,
  useCancelReservationMutation,
  useRejectReservationMutation,
  useUpdateReservationMutation,
  useArchivedReservationMutation,
  useTransferLotMutation,
} = apiReservation;
