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
import Role from "../../pages/Role";
import HomePageLayOut from "../../layout/HomePageLayout";
import Homepage from "../../pages/Homepage";
import Registration from "../../pages/Registration";
import VerifyEmail from "../../pages/VerifyEmail";

const router = createBrowserRouter([
  {
    element: <HomePageLayOut />,
    errorElement: <PreventLoginRoutes />,
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
        path: "user-management",
        index: true,
        element: (
          <AccessPermissionContext permission="role" context="routing">
            <UserManagement />
          </AccessPermissionContext>
        ),
      },

      {
        path: "user-management/user-accounts",
        index: true,
        element: (
          <AccessPermissionContext permission="user" context="routing">
            <User />
          </AccessPermissionContext>
        ),
      },
      {
        path: "user-management/role-management",
        index: true,
        element: (
          <AccessPermissionContext permission="role" context="routing">
            <Role />
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
