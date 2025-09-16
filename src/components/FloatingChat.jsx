import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Fab,
  Badge,
  Box,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Message as MessageIcon } from "@mui/icons-material";
import { useGetConversationCountsQuery } from "../redux/slices/chatSlice";

const FloatingChat = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const theme = useTheme();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const location = useLocation();

  const LoginUserCount = JSON.parse(localStorage.getItem("user"));
  const { data: conversationCounts, refetch: conversationCountsRefetch } =
    useGetConversationCountsQuery();

  console.log("conversationCounts", conversationCounts?.data?.updated_count);
  console.log("LoginUserCount", LoginUserCount);

  // Real-time listener for new messages
  console.log(LoginUserCount);
  useEffect(() => {
    if (!LoginUserCount?.id) return;

    const channel = window.Echo.private(`user.${LoginUserCount.id}`);

    channel.listen(".message.sent", (e) => {
      console.log("New message received", e.message);

      conversationCountsRefetch?.();
    });

    return () => {
      window.Echo.leave(`user.${LoginUserCount.id}`);
    };
  }, [LoginUserCount?.id, conversationCountsRefetch]);

  const handleChatClick = () => {
    if (LoginUserCount?.role_type === "admin") {
      navigate("/admin/messages");
    } else {
      navigate("/contact");
    }
  };

  // Responsive sizing configuration
  const getResponsiveStyles = () => {
    if (isMobile) {
      return {
        fabSize: { width: 48, height: 48 },
        iconSize: 20,
        position: { bottom: 16, right: 16 },
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
      };
    } else if (isTablet) {
      return {
        fabSize: { width: 52, height: 52 },
        iconSize: 22,
        position: { bottom: 20, right: 20 },
        boxShadow: "0 3px 16px rgba(0, 0, 0, 0.2)",
      };
    } else {
      return {
        fabSize: { width: 56, height: 56 },
        iconSize: 24,
        position: { bottom: 24, right: 24 },
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
      };
    }
  };

  const styles = getResponsiveStyles();

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: styles.position.bottom,
        right: styles.position.right,
        zIndex: 1300, // High z-index for floating elements
        // Ensure it doesn't interfere with mobile navigation
        "@media (max-width: 600px)": {
          bottom: styles.position.bottom + 8, // Extra space on very small screens
        },
      }}
    >
      <Tooltip
        title="Open Contacts"
        placement={isMobile ? "top" : "left"}
        arrow
      >
        <Box sx={{ position: "relative" }}>
          <Badge
            badgeContent={
              conversationCounts?.data?.updated_count > 0
                ? conversationCounts?.data?.updated_count
                : null
            }
            color="error"
            max={99}
            overlap="circular"
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            sx={{
              "& .MuiBadge-badge": {
                fontSize: isMobile ? "0.65rem" : "0.75rem",
                minWidth: isMobile ? 16 : 20,
                height: isMobile ? 16 : 20,
                zIndex: 1301, // Ensure badge appears above everything
                // Responsive badge positioning
                right: isMobile ? 2 : 4,
                top: isMobile ? 2 : 4,
              },
            }}
          >
            <Fab
              color="secondary"
              aria-label="chat"
              onClick={handleChatClick}
              size={isMobile ? "small" : "medium"}
              sx={{
                ...styles.fabSize,
                boxShadow: styles.boxShadow,
                color: "white",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: "secondary.main",
                  transform: isMobile ? "scale(1.05)" : "scale(1.1)",
                  boxShadow: isMobile
                    ? "0 4px 16px rgba(0, 0, 0, 0.2)"
                    : "0 6px 24px rgba(0, 0, 0, 0.3)",
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
                // Ensure proper touch targets on mobile
                "@media (max-width: 600px)": {
                  minWidth: 44, // Minimum touch target size
                  minHeight: 44,
                },
                // Add subtle animation for attention
                animation: unreadCount > 0 ? "pulse 2s infinite" : "none",
                "@keyframes pulse": {
                  "0%": {
                    transform: "scale(1)",
                  },
                  "50%": {
                    transform: "scale(1.02)",
                  },
                  "100%": {
                    transform: "scale(1)",
                  },
                },
              }}
            >
              <MessageIcon
                sx={{
                  fontSize: styles.iconSize,
                  // Ensure icon is properly centered
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </Fab>
          </Badge>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default FloatingChat;
