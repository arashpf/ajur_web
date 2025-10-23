import React, { useState, useEffect } from "react";
import PanelLayout from "../../components/layouts/PanelLayout";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import "animate.css";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MainListItems from "../../components/panel/listItems";
import Chart from "../../components/panel/Chart";
import Deposits from "../../components/panel/Deposits";
import Orders from "../../components/panel/Orders";
import SpinnerLoader from "../../components/panel/SpinnerLoader";
import Footer from "../../components/parts/Footer";
import SpeedDial from "../../components/panel/SpeedDial";
import WorkerFilter from "../../components/WorkerFilter";

import CatCard2 from "../../components/cards/CatCard2";
// import WorkerCard from "../../components/cards/WorkerCard";
import PanelWorkerCard from "../../components/cards/PanelWorkerCard";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRouter } from "next/router";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import HomeDial from "../../components/panel/HomeDial";

import styles from "../../components/styles/panel/index.module.css";

import axios from "axios";
import Cookies from "js-cookie";
import ProfilePicker from "../../components/pickers/ProfilePicker";
import Header from "../../components/panel/parts/Header";
import Department from "../../components/panel/department";

import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import AppBar from "@mui/material/AppBar";
import LazyLoader from "../../components/lazyLoader/Loading";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://ajur.app">
        Ajur.app
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const drawerWidth = 250;

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(0),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(0),
      },
    }),
  },
}));
const mdTheme = createTheme();

const DashboardContent = (props) => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const [loading, set_loading] = useState(true);
  const [data, set_data] = useState([]);
  const [realstateImage, set_realstateImage] = useState("");
  const [profileImage, set_profileImage] = useState(false);
  const [workers, set_workers] = useState([]);
  const [all_workers, set_all_workers] = useState([]);
  const [selectedcat, set_selectedcat] = useState(0);
  const [userInitialLat, set_userInitialLat] = useState(false);
  const [userInitialLong, set_userInitialLong] = useState(false);
  const [subcategories, set_subcategories] = useState([]);
  const [nopost, set_nopost] = useState(false);
  const [key, setKey] = React.useState("personal");
  const [department, set_department] = React.useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);

  useEffect(() => {
    var cookie_key = Cookies.get("cookie_key");
    if (cookie_key) {
      setKey(cookie_key);
    }
  }, []);

  useEffect(() => {
    setFilteredWorkers(workers);
  }, [workers]);

  useEffect(() => {
    Cookies.set("cookie_key", key, { expires: 200 });
  }, [key]);

  useEffect(() => {
    var token = Cookies.get("id_token");
    console.log("------ the token now is ------");
    console.log(token);

    if (!token) {
      router.push("/panel/auth/login");
    } else {
      console.log("------------  token is ---------------- ");
      console.log(token);

      axios({
        method: "get",
        url: "https://api.ajur.app/api/get-user",
        params: {
          token: token,
        },
      }).then(function (response) {
        set_data(response.data.user);
        console.log(
          "------------ the data we catch in pannel is --------------"
        );
        console.log(response.data.user);

        set_department(response.data.department);

        if (response.data.department) {
          // setKey('department');
        }
        set_profileImage(response.data.user.profile_url);
        set_realstateImage(response.data.user.realstate_url);
        set_loading(false);
      });

      axios({
        method: "get",
        url: "https://api.ajur.app/api/realstate-workers",
        params: {
          title: "title",
          lat: 35.12,
          long: 36.11,
          selectedcat: selectedcat,
          token: token,
          collect: "all",
        },
      }).then(function (response) {
        set_workers(response.data.workers);
        set_all_workers(response.data.workers);
        set_subcategories(response.data.subcategories);

        if (response.data.workers.length > 0) {
          set_nopost(false);
        } else {
          set_nopost(true);
        }
      });
    }
  }, []);

  const fetchWorker = (cat) => {
    console.log("the cat in fetch worker is ");

    if (cat == "all") {
      console.log("the all selected");
      set_workers(all_workers);
    } else {
      console.log(cat.id);
      set_workers(all_workers.filter((item) => item.category_id == cat.id));
    }

    return;

    var token = Cookies.get("id_token");

    axios({
      method: "get",
      url: "https://api.ajur.app/api/realstate-workers",
      params: {
        title: "title",
        lat: 35.12,
        long: 36.11,
        selectedcat: cat.id,
        token: token,
        collect: "all",
      },
    }).then(function (response) {
      set_workers(response.data.workers);
      set_subcategories(response.data.subcategories);
      set_loading(false);
      if (response.data.workers.length > 0) {
        set_nopost(false);
      } else {
        set_nopost(true);
      }
    });
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleOpenUserMenu = () => {};

  const onClickNew = () => {
    console.log("new clicked");
    router.push("/panel/new");
  };

  const renderSliderCategories = () => {
    return subcategories.map(
      (cat) => (
        <Grid key={cat.id} item xs={6} md={3} lg={2}>
          <CatCard2
            selectedcat={selectedcat}
            cat={cat}
            handleParentClick={handleParentClick}
          />
        </Grid>
      )
      // TODO: i remove <SwiperSlide> wrapper because flexDirection:row dosent worke
      // this make swipper dosent work
    );
  };

  const renderWorkers = () => {
    if (workers.length > 0) {
      // Sort workers by date (newest first)
      const sortedWorkers = [...filteredWorkers].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      return (
        <LazyLoader
          items={sortedWorkers}
          itemsPerPage={8}
          delay={800}
          renderItem={(worker) => (
            <Grid item md={4} xs={12} key={worker.id}>
              <a>
                {/* <WorkerCard worker={worker} /> */}
                <PanelWorkerCard worker={worker} />
              </a>
            </Grid>
          )}
          loadingComponent={
            <p style={{ textAlign: "center" }}>در حال بارگذاری...</p>
          }
          endComponent={
            <p style={{ textAlign: "center" }}>همه فایل‌ها بارگذاری شدند✅</p>
          }
          grid={true}
          gridProps={{ spacing: 3 }}
        />
      );
    } else {
      return (
        <Grid
          container
          spacing={3}
          className={`animate__animated animate__zoomIn`}
        >
          <Grid item xs={2} md={3}></Grid>
          <Grid item xs={8} md={6}>
            <p style={{ textAlign: "center" }}>اولین فایل خود را ثبت کنید</p>
            <div
              onClick={onClickNew}
              className={styles.new_single_type_wrapper}
            >
              <div className={styles.single_icon}></div>
              <div className={styles.single_info}>
                <p>
                  <AddCircleIcon style={{ color: "green", fontSize: 50 }} />
                </p>
              </div>
            </div>
          </Grid>
        </Grid>
      );
    }
  };

  const handleParentClick = (cat) => {
    console.log("the parent click is ");
    console.log(cat);

    set_selectedcat(cat.id);

    fetchWorker(cat);
  };

  const renderDepartmentTab = () => {
    if (department) {
      return (
        <Tab
          eventKey="department"
          title={<p>{department.name}</p>}
          className={styles["personal-tab"]}
        >
          <Container
            maxWidth="xlg"
            sx={{ mt: 7, mb: 4, paddingTop: 5, textAlign: "center" }}
          >
            <Grid container spacing={3} sx={{ paddingLeft: 3 }}>
              <Department department={department} user={data} />
            </Grid>
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Tab>
      );
    }
  };

  const renderPersonalTab = () => {
    if (1) {
      return (
        <Container
          maxWidth="lg"
          sx={{ mt: 7, mb: 4, paddingTop: 5, textAlign: "center" }}
        >
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <WorkerFilter
                workers={workers}
                onFilteredWorkersChange={setFilteredWorkers}
              />
            </Grid>
            {/* Chart */}
            {/* <Grid item xs={12} md={8} lg={9}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 240,
                    }}
                  >
                    <Chart />
                  </Paper>
                </Grid> */}
            {/* Recent Deposits */}
            {/* <Grid container>
              <Grid key={41} item xs={12} md={3} lg={2}>
                {workers.length > 0 && (
                  <CatCard2
                    selectedcat="all"
                    cat="all"
                    handleParentClick={handleParentClick}
                  />
                )}
              </Grid>
              {renderSliderCategories()}
            </Grid> */}

            {/* Recent Orders */}
            <Grid item xs={12}>
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  {renderWorkers()}
                </Grid>
              </Box>
            </Grid>
          </Grid>
          <Copyright sx={{ pt: 4 }} />
        </Container>
      );
    }
  };

  const rendertabs = () => {
    if (1) {
      return (
        <Tabs
          fill
          variant="tabs"
          style={{
            position: "fixed",
            left: 0,
            right: open ? `${drawerWidth}px` : 0,
            width: open ? `calc(100% - ${drawerWidth}px)` : "100%",
            background: "white",
            zIndex: 100,
            boxShadow: "0 4px 2px -2px gray",
          }}
          id="controlled-tab-example"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          tabItemContainerStyle={{ position: "fixed", bottom: "0" }}
        >
          <Tab
            eventKey="personal"
            title={<p>فایل ها ({all_workers.length})</p>}
            className={styles["personal-tab"]}
          >
            {renderPersonalTab()}
          </Tab>

          {renderDepartmentTab()}
        </Tabs>
      );
    }
  };

  if (loading) {
    return (
      <>
        <SpinnerLoader />
        <Footer />
      </>
    );
  } else {
    return (
      <ThemeProvider theme={mdTheme}>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <Header
            data={data}
            open={open}
            onToggle={toggleDrawer}
            drawerWidth={drawerWidth}
            profileImage={profileImage}
          />

          <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? theme.palette.grey[0]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: "100vh",
              overflow: "auto",
              transition: (theme) =>
                theme.transitions.create(["margin", "width", "transform"], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              // when drawer opens we push the main content to the left by the drawer width
              marginRight: open ? `${drawerWidth}px` : 0,
            }}
          >
            <Toolbar />

            {rendertabs()}
          </Box>
        </Box>
        {/* keep only the new-file SpeedDial and push it higher to sit above the footer */}
        <SpeedDial />
        {/* main footer added to panel page */}
        {typeof window !== "undefined" &&
          require("../../components/parts/Footer").default &&
          React.createElement(require("../../components/parts/Footer").default)}
      </ThemeProvider>
    );
  }
};

export default DashboardContent;

DashboardContent.getLayout = function (page) {
  return <PanelLayout>{page}</PanelLayout>;
};
