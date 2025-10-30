import React, { useState, useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
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

  // Use localStorage to persist the drawer state
  const [open, setOpen] = useState(() => {
    // Check if there's a saved state in localStorage
    const savedState = localStorage.getItem('header-drawer-open');
    return savedState ? JSON.parse(savedState) : true;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('header-drawer-open', JSON.stringify(open));
  }, [open]);

  const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 10,
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
    setOpen(!open);
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
            aria-label={open ? "close drawer" : "open drawer"}
            onClick={toggleDrawer}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
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
          <a
            href="/panel/profile"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            "{data.name}" | {data.phone}
          </a>
        </Toolbar>
        <Divider />
        <List component="nav">
          <MainListItems
            onCloseMenu={() => setOpen(false)}
            onGrabClicked={(value) => {
              console.log(
                "clicked from mainlist item and trigered in parent controll",
                value
              );
              setOpen(false);
            }}
          />
        </List>
      </Drawer>
    </>
  );
};

export default Header;