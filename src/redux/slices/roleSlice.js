import { apiSlice } from "./apiSlice";

export const apiRole = apiSlice
  .enhanceEndpoints({
    addTagTypes: ["Roles", "DropdownRegion"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getRole: builder.query({
        query: (params) => ({
          url: "/role",
          params,
        }),
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
    }),
  });

export const {
  useGetRoleQuery,
  useLazyGetRoleDropDownQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
  useArchivedRoleMutation,
} = apiRole;
