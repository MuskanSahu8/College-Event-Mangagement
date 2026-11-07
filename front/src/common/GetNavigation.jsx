
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LogoutIcon from "@mui/icons-material/Logout";
import EventNoteIcon from "@mui/icons-material/EventNote";
import GroupsIcon from "@mui/icons-material/Groups";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const GetNavigation = (user, isAuthenticated) => {

  // Guest navigation
  if (!isAuthenticated || !user) {
    return [
      {
        kind: "header",
        title: "GET STARTED",
      },
      {
        segment: "signin",
        title: "Sign In",
        icon: <LoginIcon />,
      },
      {
        segment: "signup",
        title: "Create Account",
        icon: <PersonAddAltIcon />,
      },
    ];
  }

  // Student navigation
  if (user.role === "student") {
    return [
      {
        kind: "header",
        title: "STUDENT MENU",
      },
      {
        segment: "student-dashboard",
        title: "Dashboard",
        icon: <DashboardIcon />,
      },
      {
        segment: "events",
        title: "Explore Events",
        icon: <EventAvailableIcon />,
      },
      {
        segment: "my-registrations",
        title: "My Registrations",
        icon: <HowToRegIcon />,
      },
      {
        segment: "my-feedback",
        title: "My Feedback",
        icon: <RateReviewIcon />,
      },
      {
        segment: "notifications",
        title: "Notifications",
        icon: <NotificationsActiveIcon />,
      },
      {
        kind: "divider",
      },
      {
        segment: "signout",
        title: "Sign Out",
        icon: <LogoutIcon />,
      },
    ];
  }

  // Organizer navigation
  if (user.role === "organizer") {
    return [
      {
        kind: "header",
        title: "ORGANIZER MENU",
      },
      {
        segment: "org-dashboard",
        title: "Dashboard",
        icon: <DashboardIcon />,
      },
      {
        segment: "create",
        title: "Create Event",
        icon: <EditCalendarIcon />,
      },
      {
        segment: "my-events",
        title: "My Events",
        icon: <EventNoteIcon />,
      },
      {
        segment: "committee",
        title: "Committee Management",
        icon: <GroupsIcon />,
      },
      {
        segment: "send-notification",
        title: "Send Notification",
        icon: <NotificationsActiveIcon />,
      },
      {
        kind: "divider",
      },
      {
        segment: "signout",
        title: "Sign Out",
        icon: <LogoutIcon />,
      },
    ];
  }

  return [];
};

export default GetNavigation;
