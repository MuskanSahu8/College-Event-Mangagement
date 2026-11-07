
import * as React from "react";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import GetNavigation from "./GetNavigation";
import {Outlet,useLocation,useNavigate,} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createTheme } from "@mui/material/styles";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import {
  Box,
  Avatar,
  Typography,
  Chip,
} from "@mui/material";
import { Link } from "react-router-dom";
import "../style/Layout.css";

// Role theme creator
const createRoleTheme = (primary, light, dark, hover) =>
  createTheme({
    palette: {
      primary: { main: primary, light, dark },
      background: {
        default: light,
        paper: "#ffffff",
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    },
  });

// Organizer theme
const organizerTheme = createRoleTheme(
  "#F97316",
  "#FFF7ED",
  "#C2410C",
  "#FFEDD5"
);

// Student theme
const studentTheme = createRoleTheme(
  "#8065D9",
  "#F8F7FF",
  "#6245BD",
  "#EEE9FF"
);

const Layout = () => {
  const { user, isAuthenticated } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const isOrganizer = user?.role === "organizer";

  // Public pages
  const publicPages = [
    "/",
    "/signin",
    "/signup",
  ];

  const isPublicPage = publicPages.includes(location.pathname);

  // Public layout
  if (isPublicPage) {
    return (
      <div className="public-layout">
        <Outlet />
      </div>
    );
  }

  // Dashboard theme
  const theme = isOrganizer
    ? organizerTheme
    : studentTheme;

  const NAVIGATION = GetNavigation(user, isAuthenticated);

  const router = {
    pathname: location.pathname,
    navigate: (path) => navigate(path),
  };

  // Sidebar footer
  const SidebarFooter = ({ mini }) => {
    if (!user) return null;

    const initials = user.name
      ? user.name.charAt(0).toUpperCase()
      : "U";

    return (
      <Box className="sidebar-user">
        <Avatar
          className="sidebar-avatar"
          sx={{
            bgcolor: isOrganizer ? "#F97316" : "#8065D9",
            color: "#ffffff",
          }}
        >
          {initials}
        </Avatar>

        {!mini && (
          <Box className="sidebar-user-details">
            <Typography className="sidebar-user-name">
              {user.name || "User"}
            </Typography>

            <Typography className="sidebar-user-email">
              {user.email || ""}
            </Typography>

            <Chip
              label={user.role || "Member"}
              size="small"
              sx={{
                mt: 0.8,
                backgroundColor: isOrganizer
                  ? "#FFEDD5"
                  : "#EEE9FF",
                color: isOrganizer
                  ? "#C2410C"
                  : "#6245BD",
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <div
      className={`ems-layout ${isOrganizer ? "organizer-theme" : "student-theme"
        }`}
    >
      <AppProvider
        navigation={NAVIGATION}
        router={router}
        theme={theme}
        branding={{
          title: "CampusConnect",
          logo: (
            <EventAvailableIcon
              sx={{
                fontSize: 32,
                color: isOrganizer ? "#F97316" : "#8065D9",
              }}
            />
          ),
        }}
      >
        <DashboardLayout
          slots={{
            sidebarFooter: SidebarFooter,
          }}
        >
          <div className="ems-page-content">
            <Outlet />
          </div>
        </DashboardLayout>
      </AppProvider>
    </div>
  );
};

export default Layout;
