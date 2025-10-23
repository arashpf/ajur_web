import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import SearchDiv from "../components/others/SearchDiv";
import WorkerCard from "../components/cards/WorkerCard";
import RealStateSmalCard from "../components/cards/realestate/RealStateSmalCard";
import DepartmentSmalCard from "../components/cards/department/DepartmentSmalCard";
import CatCard from "../components/cards/CatCard";
import MainCatCard from "../components/cards/MainCatCard";
import PropTypes from "prop-types";
import Slider from "react-slick";
import axios from "axios";
import Link from "next/link";
import FileRequest from "../components/request/FileRequest";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import LandingPage from "./assistant/G-ads/landing-page";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
// simplified buttons: using plain HTML buttons instead of animated ActionButton
import DealButton from "../components/parts/DealButton";

import ForwardIcon from "@mui/icons-material/Forward";

import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Autoplay } from "swiper";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { display, style } from "@mui/system";
// import "./styles.css";
// import required modules

function Home(props) {
  const router = useRouter();
  // Register Autoplay only on the client to avoid server-side runtime issues
  useEffect(() => {
    if (typeof window !== "undefined") {
      SwiperCore.use([Autoplay]);
    }
  }, []);

  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState(false);
  const [cats, set_cats] = useState();
  const [main_cats, set_main_cats] = useState();
  const [sub_cats, set_sub_cats] = useState();
  const [realestates, set_realestates] = useState();
  const [departments, set_departments] = useState();
  const [title1, set_title1] = useState();
  const [title2, set_title2] = useState();
  const [title3, set_title3] = useState();
  const [collection1, set_collection1] = useState();
  const [collection2, set_collection2] = useState();
  const [collection3, set_collection3] = useState();
  const [the_city, set_the_city] = useState();
  const [the_neighborhoods, set_the_neighborhoods] = useState();

  const [is_have_favorited, set_is_have_favorited] = useState(false);
  const [is_have_history, set_is_have_history] = useState(false);

  const [favorite_workers, set_favorite_workers] = useState([]);
  const [history_workers, set_history_workers] = useState([]);
  const [clickedAction, setClickedAction] = useState(null);
  const [buyVisible, setBuyVisible] = useState(true);
  const [rentVisible, setRentVisible] = useState(true);
  const [isStacked, setIsStacked] = useState(true); // true when buttons are stacked (narrow screens)
  const [dealCats, setDealCats] = useState();
  const [animState, setAnimState] = useState(null); // null | 'pushed' | 'pullIn'
  const [dealAnim, setDealAnim] = useState(null); // null | 'popOut'
  const [showVpnDialog, setShowVpnDialog] = useState(false);
  const [vpnChecked, setVpnChecked] = useState(false);
  // simplified visibility control
  const selectAction = (type) => {
    // start push animation; after animation finishes, show deal grid and hide buttons
    setAnimState("pushed");
    setTimeout(() => {
      setClickedAction(type);
      setBuyVisible(false);
      setRentVisible(false);
    }, 420);
  };

  const clearAction = () => {
    // first pop out the deal grid, then show main buttons from the top
    setDealAnim("popOut");
    // wait for pop-out animation to finish, then remove deal grid and pull in buttons
    setTimeout(() => {
      setDealAnim(null);
      setClickedAction(null);
      setBuyVisible(true);
      setRentVisible(true);
      setAnimState("pullIn");
      setTimeout(() => setAnimState(null), 520);
    }, 240); // matches dealPopOutAnim duration (220ms) plus small buffer
  };

  console.log(dealCats);

  useEffect(() => {
    // update stacked/side-by-side state based on viewport width
    function updateStacked() {
      // keep in sync with CSS breakpoint (600px)
      setIsStacked(
        typeof window !== "undefined" ? window.innerWidth < 600 : true
      );
    }

    updateStacked();
    window.addEventListener("resize", updateStacked);
    return () => window.removeEventListener("resize", updateStacked);
  }, []);

  // Lightweight VPN/proxy detection using a public IP info service and heuristics.
  // If detected, show a dialog asking user to disable VPN. Respect a cookie "hide_vpn_warning" when set.
  async function detectVpn() {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) return false;
      const data = await res.json();

      const org = (data.org || data.asn || "").toString().toLowerCase();
      // Keywords that commonly indicate VPN / proxy / datacenter providers.
      const vpnKeywords = [
        "vpn",
        "proxy",
        "vpn service",
        "expressvpn",
        "nordvpn",
        "surfshark",
        "private internet access",
        "pia",
        "ipvanish",
        "purevpn",
        "windscribe",
        "protonvpn",
        "torguard",
        "openvpn",
        "digitalocean",
        "amazon",
        "amazon.com",
        "amazon web services",
        "google cloud",
        "google llc",
        "microsoft",
        "linode",
        "hetzner",
        "ovh",
        "vultr",
        "cloudflare",
      ];

      for (const k of vpnKeywords) {
        if (org.includes(k)) return true;
      }

      return false;
    } catch (e) {
      // network errors or blocked requests — silently fail
      // console.warn('vpn detect failed', e);
      return false;
    }
  }

  useEffect(() => {
    // run detection once on client when not hidden by cookie
    if (typeof window === "undefined") return;
    if (Cookies.get("hide_vpn_warning")) {
      setVpnChecked(true);
      return;
    }

    let mounted = true;
    detectVpn().then((isVpn) => {
      if (!mounted) return;
      if (isVpn) setShowVpnDialog(true);
      setVpnChecked(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const handleBackButtons = () => {
    clearAction();
  };

  useEffect(() => {
    // Set up timeout first
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.error("Loading timeout - showing error state");
        set_loading(false);
        set_error(true);
      }
    }, 10000); // 10 second timeout

    //  Cookies.set('selected_city','');
    var selected_city = props.trigeredcity;

    //  if(props.url_city){
    //   alert('city set in url');
    //   Cookies.set('selected_city',props.url_city);
    //  }else

    if (!selected_city) {
      //  router.push("/city-selection");
      // Cookies.set('selected_city','رباط کریم');
      selected_city = "رباط کریم";
      //   Cookies.set('selected_city_lat', '35.47229675', { expires: 365 });
      // Cookies.set('selected_city_lng', '51.08457936', { expires: 365 });
    }

    axios({
      method: "get",
      url: "https://api.ajur.app/api/base",
      params: {
        city: props.url_city ? props.url_city : selected_city,
      },
    })
    .then(function (response) {
      // Clear timeout on success
      clearTimeout(timeoutId);
      
      set_cats(response.data.cats);
      set_the_city(response.data.the_city);
      set_the_neighborhoods(response.data.the_neighborhoods);
      set_main_cats(response.data.main_cats);
      set_sub_cats(response.data.sub_cats);
      set_realestates(response.data.realstates);
      setDealCats(response.data.sub_cats);

      console.log("the maincat data in base is --------------------");
      console.log(response.data.main_cats);

      console.log(response.data.sub_cats);

      set_realestates(response.data.realstates);

      console.log("the departments data in base is --------------------");
      console.log(response.data.departments);

      set_departments(response.data.departments);

      set_title1(response.data.title1);

      set_title2(response.data.title2);

      set_title3(response.data.title3);

      set_collection1(response.data.collection1);
      set_collection2(response.data.collection2);
      set_collection3(response.data.collection3);

      set_loading(false);
      set_error(false);
    })
    .catch(function (error) {
      // Clear timeout on error
      clearTimeout(timeoutId);
      console.error("API request failed:", error);
      set_loading(false);
      set_error(true);
    });

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [props.trigeredcity]);

  useEffect(() => {
    var faviorited = Cookies.get("favorited");

    if (!faviorited) {
      return;
    }

    // const newProduct = JSON.parse(faviorited);
    const newProduct = JSON.parse(faviorited);

    axios({
      method: "get",
      url: "https://api.ajur.app/api/history-workers",
      params: {
        workers_holder: newProduct,
      },
    })
    .then(function (response) {
      set_favorite_workers(response.data);

      if (response.data.length == 0) {
        console.log("trigered no post error");
        set_is_have_favorited(false);
      } else {
        set_is_have_favorited(true);
      }
      console.log("the data now is+++++++++++++++++++++ ");
      console.log(response.data);
    })
    .catch(function (error) {
      console.error("Error loading favorite workers:", error);
      set_is_have_favorited(false);
    });

    // alert(newProduct);
  }, []);

  useEffect(() => {
    var history = Cookies.get("history");

    if (!history) {
      return;
    }

    // const newProduct = JSON.parse(faviorited);
    const newProduct = JSON.parse(history);

    axios({
      method: "get",
      url: "https://api.ajur.app/api/history-workers",
      params: {
        workers_holder: newProduct,
      },
    })
    .then(function (response) {
      set_history_workers(response.data);

      if (response.data.length == 0) {
        console.log("trigered no post error");
        set_is_have_history(false);
      } else {
        set_is_have_history(true);
      }
      console.log("the data now is+++++++++++++++++++++ ");
      console.log(response.data);
    })
    .catch(function (error) {
      console.error("Error loading history workers:", error);
      set_is_have_history(false);
    });

    // alert(newProduct);
  }, []);

  function AlterLoading() {
    console.log("loading is fired ~~~~~");
    set_loading(!loading);
  }

  function renderDefaultCity() {
    if (1) {
      return "رباط کریم";
    }
  }

  const renderSliderCategories = () => {
    var selected_city = Cookies.get("selected_city");

    return main_cats.map((cat) => (
      <SwiperSlide
        key={cat.id}
        onClick={AlterLoading}
        className={styles["single_cat_swipper"]}
      >
        <Link
          href={`/${
            props.trigeredcity ? props.trigeredcity : renderDefaultCity()
          }/${cat.name}`}
        >
          <a>
            <MainCatCard key={cat.id} cat={cat} />
          </a>
        </Link>
      </SwiperSlide>
    ));
  };

  const renderSliderOne = () => {
    return collection1.map((worker) => (
      <SwiperSlide key={worker.id} onClick={AlterLoading}>
        <Link href={`/worker/${worker.id}?slug=${worker.slug}`}>
          <a>
            <WorkerCard key={worker.id} worker={worker} />
          </a>
        </Link>
      </SwiperSlide>
    ));
  };

  const renderSlidertwo = () => {
    return collection2.map((worker) => (
      <SwiperSlide key={worker.id} onClick={AlterLoading}>
        <Link href={`/worker/${worker.id}?slug=${worker.slug}`}>
          <a>
            <WorkerCard key={worker.id} worker={worker} />
          </a>
        </Link>
      </SwiperSlide>
    ));
  };

  const renderSliderthree = () => {
    return collection3.map((worker) => (
      <SwiperSlide key={worker.id} onClick={AlterLoading}>
        <Link href={`/worker/${worker.id}?slug=${worker.slug}`}>
          <a>
            <WorkerCard key={worker.id} worker={worker} />
          </a>
        </Link>
      </SwiperSlide>
    ));
  };

  const renderSliderDepartments = () => {
    return departments.map((department) => (
      <SwiperSlide key={department.id} onClick={AlterLoading}>
        <Link href={`/department/${department.id}?slug=${department.slug}`}>
          <a>
            <DepartmentSmalCard key={department.id} department={department} />
          </a>
        </Link>
      </SwiperSlide>
    ));
  };

  const renderSliderRealState = () => {
    return realestates.map((realstate) => (
      <SwiperSlide key={realstate.id} onClick={AlterLoading}>
        <Link href={`/realestates/${realstate.id}?slug=${realstate.slug}`}>
          <a>
            <RealStateSmalCard key={realstate.id} realstate={realstate} />
          </a>
        </Link>
      </SwiperSlide>
    ));
  };

  const renderSomeHistoryeWorkers = () => {
    return history_workers.map((worker) => (
      <SwiperSlide key={worker.id} onClick={AlterLoading}>
        <Link href={`/worker/${worker.id}?slug=${worker.slug}`}>
          <a>
            <WorkerCard key={worker.id} worker={worker} />
          </a>
        </Link>
      </SwiperSlide>
    ));
  };

  const renderSomeFavoriteWorkers = () => {
    return favorite_workers.map((worker) => (
      <SwiperSlide key={worker.id} onClick={AlterLoading}>
        <Link href={`/worker/${worker.id}?slug=${worker.slug}`}>
          <a>
            <WorkerCard key={worker.id} worker={worker} />
          </a>
        </Link>
      </SwiperSlide>
    ));
  };

  const renderHistoryWorkers = () => {
    if (1) {
      return (
        history_workers.length > 0 && (
          <div style={{ paddingBottom: 10 }}>
            <div className={styles["title"]}>
              <h2>آخرین بازدید های شما</h2>
            </div>
            <Swiper
              slidesPerView={1}
              spaceBetween={20}
              autoplay={{
                delay: 3000,
                disableOnInteraction: true,
                pauseOnMouseEnter: true,
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                200: {
                  slidesPerView: 1,
                  spaceBetween: 20,

                  navigation: {
                    enabled: true,
                  },
                },

                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                  navigation: {
                    enabled: true,
                  },
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                  navigation: {
                    enabled: true,
                  },
                },
                1400: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                  navigation: {
                    enabled: true,
                  },
                },
              }}
              modules={[Pagination, Navigation, Autoplay]}
              className={styles["worker-swiper"]}
            >
              {renderSomeHistoryeWorkers()}
            </Swiper>
          </div>
        )
      );
    }
  };

  const renderFavoriteWorkers = () => {
    if (1) {
      return (
        favorite_workers.length > 0 && (
          <div style={{ paddingBottom: 20 }}>
            <div className={styles["title"]}>
              <h2>آخرین مورد پسند های شما</h2>
            </div>
            <Swiper
              slidesPerView={1}
              spaceBetween={8}
              autoplay={{
                delay: 3000,
                disableOnInteraction: true,
                pauseOnMouseEnter: true,
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                200: {
                  slidesPerView: 1,
                  spaceBetween: 2,

                  navigation: {
                    enabled: true,
                  },
                },

                640: {
                  slidesPerView: 2,
                  spaceBetween: 3,
                  navigation: {
                    enabled: true,
                  },
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                  navigation: {
                    enabled: true,
                  },
                },
                1400: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                  navigation: {
                    enabled: true,
                  },
                },
              }}
              modules={[Pagination, Navigation, Autoplay]}
              className={styles["worker-swiper"]}
            >
              {renderSomeFavoriteWorkers()}
            </Swiper>
          </div>
        )
      );
    }
  };

  const renderOrSpinner = () => {
    if (error) {
      return (
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          <h2>مشکلی در بارگذاری داده‌ها پیش آمده است</h2>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              margin: "10px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            تلاش مجدد
          </button>
        </div>
      );
    }
    if (loading) {
      return (
        <div className="spinnerImageView">
          <img
            className="spinner-image"
            src="/logo/ajour-gif.gif"
            alt="ajur logo"
          />
        </div>
      );
    } else {
      return (
        <div>
          <main className={styles["main"]}>
            {/* Quick action buttons for Buy / Rent (stacked on small, side-by-side on larger) */}
            <div
              className={`${styles.actionButtonsRow} ${
                animState === "pushed" ? styles.pushed : ""
              } ${animState === "pullIn" ? styles.pullIn : ""}`}
            >
              <div className={styles.actionBtnWrap}>
                {rentVisible && (
                  <div
                    className={styles.actionCard}
                    onClick={() => selectAction("rent")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        selectAction("rent");
                    }}
                    aria-label="اجاره"
                  >
                    <img
                      src="/buttons/rent.png"
                      alt="اجاره"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        padding: "30px 20px",
                      }}
                    />
                  </div>
                )}
              </div>
              <div className={styles.actionBtnWrap}>
                {buyVisible && (
                  <div
                    className={styles.actionCard}
                    onClick={() => selectAction("buy")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        selectAction("buy");
                    }}
                    aria-label="خرید"
                  >
                    {/* Replaced content with single PNG to keep layout & animations but simplify visuals */}
                    <img
                      src="/buttons/buy.png"
                      alt="خرید"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        padding: "30px 20px",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Deal categories grid when buy or rent is selected */}
            {clickedAction && (
              <div
                className={`${styles.dealGrid} ${
                  dealAnim === "popOut" ? styles.dealPopOut : ""
                }`}
                style={{ maxWidth: 760, margin: "12px auto", padding: 12 }}
              >
                <div className={styles.dealHeader}>
                  <button
                    className={styles.backButton}
                    onClick={handleBackButtons}
                    aria-label="بازگشت"
                  >
                    <svg
                      className={styles.backIcon}
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 12 H8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 7 L4 12 L9 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className={styles.dealTitle}>
                    {clickedAction === "buy"
                      ? "\u062f\u0633\u062a\u0647 \u0628\u0646\u062f\u06cc \u0647\u0627\u06cc \u062e\u0631\u06cc\u062f"
                      : "\u062f\u0633\u062a\u0647 \u0628\u0646\u062f\u06cc \u0647\u0627\u06cc \u0627\u062c\u0627\u0631\u0647"}
                  </div>
                </div>
                <div className={styles.dealGridInner}>
                  {sub_cats
                    .filter((c) =>
                      clickedAction === "buy"
                        ? c.type === "sell"
                        : c.type === "rent"
                    )
                    .map((cat, idx) => (
                      <DealButton
                        key={cat.id}
                        title={cat.name}
                        src={`/cats_image/sub-cats/${cat.id}.png`}
                        onClick={() => {
                          // navigate to the same URL pattern the old main category links used
                          const city = props.trigeredcity
                            ? props.trigeredcity
                            : renderDefaultCity();
                          // use router.push to change the path so pages/index.js will receive the category segment
                          // encodeURIComponent in case cat.name contains spaces or non-latin chars
                          router.push(
                            `/${encodeURIComponent(city)}/${encodeURIComponent(
                              cat.name
                            )}`
                          );
                        }}
                        style={{ animationDelay: `${idx * 80}ms` }}
                      />
                    ))}
                </div>
              </div>
            )}
            <div className={styles["main-row"]}>
              {/* <SearchDiv
                loading={AlterLoading}
                the_city={the_city}
                the_neighborhoods={the_neighborhoods}
              /> */}

              {renderHistoryWorkers()}
              {renderFavoriteWorkers()}

              {/* <Swiper
                slidesPerView={1}
                spaceBetween={10}
                pagination={{ clickable: true }}
                // autoplay
                // autoplay={true}

                autoplay={{
                  delay: 5000,
                  disableOnInteraction: true,
                  pauseOnMouseEnter: true
                }}
                breakpoints={{
                  200: {
                    slidesPerView: 2,
                    spaceBetween: 10
                  },

                  640: {
                    slidesPerView: 2,
                    spaceBetween: 10
                  },
                  768: {
                    slidesPerView: 2,
                    spaceBetween: 20
                  },
                  1400: {
                    slidesPerView: 4,
                    spaceBetween: 30
                  }
                }}
                modules={[Pagination, Navigation]}
                // className={styles["cat-swiper"]}
              >
                {renderSliderCategories()}
              </Swiper> 
                <div>
                  <div className={styles["title"]}>
                    <Link
                      href={`/${props.trigeredcity
                        ? props.trigeredcity
                        : renderDefaultCity()}/فروش زمین مسکونی`}
                    >
                      <h2>
                        {title1}
                      </h2>
                    </Link>
                  </div>
                  <Swiper
                    slidesPerView={1}
                    spaceBetween={8}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: true,
                      pauseOnMouseEnter: true
                    }}
                    pagination={{ clickable: true }}
                    breakpoints={{
                      200: {
                        slidesPerView: 1,
                        spaceBetween: 2,

                        navigation: {
                          enabled: true
                        }
                      },

                      640: {
                        slidesPerView: 2,
                        spaceBetween: 3,
                        navigation: {
                          enabled: true
                        }
                      },
                      768: {
                        slidesPerView: 3,
                        spaceBetween: 20,
                        navigation: {
                          enabled: true
                        }
                      },
                      1400: {
                        slidesPerView: 4,
                        spaceBetween: 20,
                        navigation: {
                          enabled: true
                        }
                      }
                    }}
                    modules={[Pagination, Navigation]}
                    className={styles["worker-swiper"]}
                  >
                    {renderSliderOne()}

                    <SwiperSlide>
                      <Link
                        href={`/${props.trigeredcity
                          ? props.trigeredcity
                          : renderDefaultCity()}/فروش زمین مسکونی`}
                      >
                        <div className={styles["more-swiper"]}>
                          <p className={styles["more-swiper-p"]}>
                            {" "}<p>نمایش موارد بیشتر</p>{" "}
                            <ForwardIcon
                              className={styles["more-swiper-icon"]}
                            />{" "}
                          </p>
                        </div>
                      </Link>
                    </SwiperSlide>
                  </Swiper>
                </div>
              )} */}

              {/* {collection2.length > 0 && (
                <div>
                  <div className={styles["title"]}>
                    <Link
                      href={`/${props.trigeredcity
                        ? props.trigeredcity
                        : renderDefaultCity()}/فروش آپارتمان`}
                    >
                      <h2>
                        {title2}{" "}
                      </h2>
                    </Link>
                  </div>
                  <Swiper
                    slidesPerView={1}
                    spaceBetween={8}
                    navigation
                    pagination={{ clickable: true }}
                    // autoplay
                    // autoplay={true}

                    breakpoints={{
                      200: {
                        slidesPerView: 1,
                        spaceBetween: 2,

                        navigation: {
                          enabled: true
                        }
                      },

                      640: {
                        slidesPerView: 2,
                        spaceBetween: 10,
                        navigation: {
                          enabled: true
                        }
                      },
                      768: {
                        slidesPerView: 3,
                        spaceBetween: 20,
                        navigation: {
                          enabled: true
                        }
                      },
                      1400: {
                        slidesPerView: 4,
                        spaceBetween: 20,
                        navigation: {
                          enabled: true
                        }
                      }
                    }}
                    modules={[Pagination, Navigation]}
                    className={styles["worker-swiper"]}
                  >
                    {renderSlidertwo()}
                    <SwiperSlide>
                      <Link
                        href={`/${props.trigeredcity
                          ? props.trigeredcity
                          : renderDefaultCity()}/فروش آپارتمان`}
                      >
                        <div className={styles["more-swiper"]}>
                          <p className={styles["more-swiper-p"]}>
                            {" "}<p>نمایش موارد بیشتر</p>{" "}
                            <ForwardIcon
                              className={styles["more-swiper-icon"]}
                            />{" "}
                          </p>
                        </div>
                      </Link>
                    </SwiperSlide>
                  </Swiper>
                </div>
              )} */}

              {collection3.length > 0 && (
                <div>
                  <div className={styles["title"]}>
                    <Link
                      href={`/${
                        props.trigeredcity
                          ? props.trigeredcity
                          : renderDefaultCity()
                      }/فروش باغ و باغچه`}
                    >
                      <h2>{title3} </h2>
                    </Link>
                  </div>
                  <Swiper
                    slidesPerView={1}
                    spaceBetween={20}
                    navigation
                    pagination={{ clickable: true }}
                    breakpoints={{
                      200: {
                        slidesPerView: 1,
                        spaceBetween: 10,

                        navigation: {
                          enabled: true,
                        },
                      },

                      640: {
                        slidesPerView: 2,
                        spaceBetween: 10,
                        navigation: {
                          enabled: true,
                        },
                      },
                      768: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                        navigation: {
                          enabled: true,
                        },
                      },
                      1400: {
                        slidesPerView: 4,
                        spaceBetween: 20,
                        navigation: {
                          enabled: true,
                        },
                      },
                    }}
                    modules={[Pagination, Navigation]}
                    className={styles["worker-swiper"]}
                  >
                    {renderSliderthree()}

                    <SwiperSlide>
                      <Link
                        href={`/${
                          props.trigeredcity
                            ? props.trigeredcity
                            : renderDefaultCity()
                        }/فروش باغ و باغچه`}
                      >
                        <div className={styles["more-swiper"]}>
                          <p className={styles["more-swiper-p"]}>
                            {" "}
                            <p>نمایش موارد بیشتر</p>{" "}
                            <ForwardIcon
                              className={styles["more-swiper-icon"]}
                            />{" "}
                          </p>
                        </div>
                      </Link>
                    </SwiperSlide>
                  </Swiper>
                </div>
              )}

              <FileRequest />

              <div className={styles["title"]}>
                <h2>بهترین دپارتمان های املاک آجر {the_city.title}</h2>
              </div>

              <div>
                <Swiper
                  slidesPerView={1}
                  spaceBetween={8}
                  navigation
                  pagination={{ clickable: true }}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  breakpoints={{
                    200: {
                      slidesPerView: 2,
                      spaceBetween: 15,
                    },

                    640: {
                      slidesPerView: 4,
                      spaceBetween: 20,
                    },
                    768: {
                      slidesPerView: 4,
                      spaceBetween: 25,
                    },
                    1400: {
                      slidesPerView: 8,
                      spaceBetween: 35,
                    },
                  }}
                  modules={[Pagination, Navigation, Autoplay]}
                  className={styles["cat-swiper"]}
                >
                  {renderSliderDepartments()}
                </Swiper>
              </div>

              <div className={styles["title"]}>
                <h2>بهترین مشاورین املاک آجر {the_city.title}</h2>
              </div>

              <div>
                <Swiper
                  slidesPerView={1}
                  spaceBetween={8}
                  navigation
                  pagination={{ clickable: true }}
                  breakpoints={{
                    200: {
                      slidesPerView: 2,
                      spaceBetween: 15,
                    },

                    640: {
                      slidesPerView: 4,
                      spaceBetween: 20,
                    },
                    768: {
                      slidesPerView: 4,
                      spaceBetween: 25,
                    },
                    1400: {
                      slidesPerView: 7,
                      spaceBetween: 35,
                    },
                  }}
                  modules={[Pagination, Navigation, Autoplay]}
                  className={styles["cat-swiper"]}
                  style={{
                    marginBottom: "30px",
                  }}
                >
                  {renderSliderRealState()}
                </Swiper>
              </div>
            </div>
          </main>
        </div>
      );
    }
  };
  return (
    <div className={styles.container}>
      <Head>
        <meta charset="UTF-8" />
        <meta name="robots" content="max-image-preview:large" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <title> آجر : مشاور املاک هوشمند </title>
        <meta
          name="description"
          content="مشاور املاک هوشمند آجر مشاور املاکی به وسعت ایران با صدها مشاور مسلط به منطقه"
        />
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
        <meta property="og:locale" content="fa_IR" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fa_IR" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="آجر : مشاور املاک هوشمند " />
        <meta
          property="og:description"
          content="از خرید و فروش خانه و ویلا تا مشاوره برای سرمایه گزاری در مشاور املاک هوشمند آجر"
        />
        <meta property="og:url" content="https://ajur.app" />
        <meta property="og:site_name" content="آجر : مشاور املاک هوشمند " />
        <meta
          property="article:published_time"
          content="2020-05-19T21:34:43+00:00"
        />
        <meta
          property="article:modified_time"
          content="2022-01-28T03:47:57+00:00"
        />
        <meta
          property="og:image"
          content="https://ajur.app/logo/ajour-meta-image.jpg"
        />
        <meta property="og:image:width" content="1080" />
        <meta property="og:image:height" content="702" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:label1" content="Written by" />
        <meta name="twitter:data1" content="آرش پیمانی فر" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://ajur.app" />
      </Head>

      {/* VPN warning dialog - non-modal floating widget on bottom-left */}
      <Dialog
        open={showVpnDialog}
        onClose={(event, reason) => {
          // ignore backdrop clicks (we hide backdrop) so clicks on page don't close it
          if (reason === "backdropClick") return;
          setShowVpnDialog(false);
        }}
        aria-labelledby="vpn-warning-title"
        hideBackdrop
        // prevent focus trapping so background remains interactive
        disableEnforceFocus
        disableAutoFocus
        // ModalProps: make the modal container pass pointer events through so page stays interactive
        ModalProps={{
          keepMounted: true,
          disableEnforceFocus: true,
          disableAutoFocus: true,
          // make container ignore pointer events so clicks go through to the page
          style: { pointerEvents: "none" },
        }}
        // PaperProps: position fixed bottom-left and accept pointer events
        PaperProps={{
          style: {
            pointerEvents: "auto",
            position: "fixed",
            bottom: 16,
            left: 16,
            margin: 0,
            borderRadius: 12,
            padding: "10px 14px",
            minWidth: 220,
            zIndex: 1400,
          },
          className: styles.vpnDialogPaper,
        }}
      >
        <DialogTitle id="vpn-warning-title"></DialogTitle>
        <DialogContent>
          برای استفاده بهتر از آجر، لطفا فیلترشکن خود را خاموش کنید
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              // hide for the rest of today (until local midnight)
              try {
                const now = new Date();
                const endOfDay = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate() + 1
                );
                Cookies.set("hide_vpn_warning", "1", { expires: endOfDay });
              } catch (e) {
                // fallback to 1 day expiry if Date isn't accepted
                Cookies.set("hide_vpn_warning", "1", { expires: 1 });
              }
              setShowVpnDialog(false);
            }}
            color="primary"
          >
            بستن
          </Button>
          <Button
            onClick={() => {
              // set cookie to hide future warnings for 365 days
              Cookies.set("hide_vpn_warning", "1", { expires: 365 });
              setShowVpnDialog(false);
            }}
            color="primary"
          >
            دیگر نمایش نده
          </Button>
        </DialogActions>
      </Dialog>

      <main className={styles.main}>{renderOrSpinner()}</main>
    </div>
  );
}

// This gets called on every request

export function getServerSideProps(props) {
  // const city = context.query.city ? context.query.city : false;
  const city = props.city ? props.city : false;

  return {
    props: {
      url_city: city,
    }, // will be passed to the page component as props
  };
}

export default Home;