import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PrivateRoutes from "./PrivateRoutes";
import PreventLoginRoutes from "./PreventLoginRoutes";
import Mainlayout from "../../layout/MainLayout";
import Login from "../../pages/Login";
import NotFound from "../../pages/NotFound";
import Dashboard from "../../pages/Dashboard";
import Masterlist from "../../pages/Masterlist";
import AccessPermissionContext from "./AccessPermissionContext";
import UserManagement from "../../pages/UserManagement";
import User from "../../pages/User";
import HomePageLayOut from "../../layout/HomePageLayout";
import Homepage from "../../pages/Homepage/Homepage";
import Registration from "../../pages/Registration/Registration";
import VerifyEmail from "../../pages/VerifyEmail";
import Maps from "../../pages/Maps/Maps";
import Cemeteries from "../../pages/Cemeteries/Cemeteries";
import Deceased from "../../pages/Deceased/Deceased";
import MapDeceased from "../../pages/MapDeceased/MapDeceased";

const router = createBrowserRouter([
  {
    element: <HomePageLayOut />,
    children: [
      {
        path: "/",
        element: <Homepage />,
      },
      {
        path: "/registration",
        element: <Registration />,
      },
      {
        path: "/maps",
        element: <Maps />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/verify/:id/:hash",
        element: <VerifyEmail />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "/admin",
    element: <Mainlayout />,
    errorElement: <PrivateRoutes />, // Wrap the dashboard route with PrivateRoutes
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "masterlist",
        index: true,
        element: <Masterlist />,
      },
      {
        path: "masterlist/cemeteries",
        index: true,
        element: (
          <AccessPermissionContext permission="admin" context="routing">
            <Cemeteries />
          </AccessPermissionContext>
        ),
      },
      {
        path: "masterlist/cemetery-deceased",
        index: true,
        element: (
          <AccessPermissionContext permission="admin" context="routing">
            <MapDeceased />
          </AccessPermissionContext>
        ),
      },
      {
        path: "masterlist/deceased",
        index: true,
        element: (
          <AccessPermissionContext permission="admin" context="routing">
            <Deceased />
          </AccessPermissionContext>
        ),
      },
      {
        path: "user-management",
        index: true,
        element: (
          <AccessPermissionContext permission="admin" context="routing">
            <UserManagement />
          </AccessPermissionContext>
        ),
      },

      {
        path: "user-management/user-accounts",
        index: true,
        element: (
          <AccessPermissionContext permission="admin" context="routing">
            <User />
          </AccessPermissionContext>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export const RouterModule = () => {
  return <RouterProvider router={router} />;
};
