import React from "react";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ProfilePicker from "../../pickers/ProfilePicker";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import MainListItems from "../../panel/listItems";

const Header = (props) => {
  const data = props.data;
  const profileImage = props.profileImage;
  const drawerWidth = props.drawerWidth || 400;
  const theme = useTheme();

  // detect mobile vs desktop
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // default open state: open on desktop, closed on mobile
  const [internalOpen, setInternalOpen] = React.useState(!isMobile);
  const open = typeof props.open === "boolean" ? props.open : internalOpen;

  // update drawer open state when breakpoint changes
  React.useEffect(() => {
    setInternalOpen(!isMobile);
  }, [isMobile]);

  const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open &&
      !isMobile && {
        marginRight: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }),
  }));

  const toggleDrawer = () => {
    if (props.onToggle && typeof props.onToggle === "function") {
      props.onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    "& .MuiDrawer-paper": {
      position: "fixed",
      right: 0,
      top: 0,
      height: "100vh",
      width: isMobile ? "100%" : drawerWidth,
      whiteSpace: "nowrap",
      boxSizing: "border-box",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      ...(open
        ? {}
        : {
            overflowX: "hidden",
            width: 0,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }),
    },
  }));

  return (
    <>
      <AppBar style={{ background: "#b92a31" }} position="absolute" open={open}>
        <Toolbar>
          {/* Profile picture on the left */}
          <Box sx={{ flexGrow: 0, mr: 2 }}>
            <ProfilePicker img={profileImage} size={50} />
          </Box>

          {/* Center title */}
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1, textAlign: "center" }}
          >
            {data.name} {data.family}
          </Typography>

          {/* Menu button on the right */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              ...(open && !isMobile && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer that opens from right */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          "& .MuiDrawer-paper": {
            right: 0,
            left: "auto",
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            px: [1],
          }}
        >
          <IconButton onClick={toggleDrawer}>
            <ChevronRightIcon />
          </IconButton>
          <a href="/panel/profile" style={{ textDecoration: "none", color: "inherit" }}>
            "{data.name}" | {data.phone}
          </a>
        </Toolbar>
        <Divider />
        <List component="nav">
          <MainListItems
            onGrabClicked={(value) => {
              console.log(
                "clicked from mainlist item and trigered in parent controll",
                value
              );
              if (props.onToggle && typeof props.onToggle === "function") {
                props.onToggle();
              } else {
                setInternalOpen(false);
              }
            }}
          />
        </List>
      </Drawer>
    </>
  );
};

export default Header;
