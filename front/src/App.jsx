
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "./common/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Authentication
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Signout from "./pages/Signout";

// Public homepage
import Home from "./pages/Home";

// Dashboards
import StudentDashboard from "./pages/StuDashboard";
import OrgDashboard from "./pages/OrgDashboard";

// Events
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import EventCreate from "./pages/EventCreate";
import EditEvent from "./pages/EditEvent";
import RegisterEvent from "./pages/RegisterEvent";

// Student features
import Feedback from "./pages/Feedback";
import MyRegistrations from "./pages/MyRegistration";
import MyFeedback from "./pages/MyFeedback";
import StudentNotifications from "./pages/StudentNotifications";

// Organizer features
import MyEvents from "./pages/MyEvent";
import CreateCommittee from "./pages/CreateCommittee";
import SendNotification from "./pages/SendNotification";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // PUBLIC ROUTES
      {
        index: true,
        element: <Home />,
      },
      {
        path: "signin",
        element: <Signin />,
      },
      {
        path: "signup",
        element: <Signup />,
      },

      // SHARED ROUTES
      {
        element: (
          <ProtectedRoute allowedRoles={["student", "organizer"]} />
        ),
        children: [
          {
            path: "events",
            element: <Events />,
          },
          {
            path: "event/:id",
            element: <EventDetail />,
          },
        ],
      },

      // STUDENT ROUTES
      {
        element: <ProtectedRoute allowedRoles={["student"]} />,
        children: [
          {
            path: "student-dashboard",
            element: <StudentDashboard />,
          },
          {
            path: "event/:id/register",
            element: <RegisterEvent />,
          },
          {
            path: "event/:id/feedback",
            element: <Feedback />,
          },
          {
            path: "my-registrations",
            element: <MyRegistrations />,
          },
          {
            path: "my-feedback",
            element: <MyFeedback />,
          },
          {
            path: "notifications",
            element: <StudentNotifications />,
          },
        ],
      },

      // ORGANIZER ROUTES
      {
        element: <ProtectedRoute allowedRoles={["organizer"]} />,
        children: [
          {
            path: "org-dashboard",
            element: <OrgDashboard />,
          },
          {
            path: "create",
            element: <EventCreate />,
          },
          {
            path: "my-events",
            element: <MyEvents />,
          },
          {
            path: "event/:id/edit",
            element: <EditEvent />,
          },
          {
            path: "committee",
            element: <CreateCommittee />,
          },
          {
            path: "send-notification",
            element: <SendNotification />,
          },
        ],
      },

      // SIGN OUT
      {
        path: "signout",
        element: <Signout />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    </>
  );
}

export default App;
