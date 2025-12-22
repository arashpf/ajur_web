import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import SearchDiv from "../components/others/SearchDiv";
import WorkerCard from "../components/cards/WorkerCard";
import RealStateSmalCard from "../components/cards/realestate/RealStateSmalCard";
import DepartmentSmalCard from "../components/cards/department/DepartmentSmalCard";
import CatCard from "../components/cards/CatCard";
import MainCatCard from "../components/cards/MainCatCard";


import Slider from "react-slick";
import axios from "axios";
import Link from "next/link";
import FileRequest from "../components/request/FileRequest.jsx";
import CityChangeAlertDialog from "../components/dialogs/CityChangeAlertDialog";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const FeaturesHub = dynamic(() => import("../components/accesshub"), {
  ssr: false,
});

import LandingPage from "./assistant/G-ads/landing-page";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
// simplified buttons: using plain HTML buttons instead of animated ActionButton
import DealButton from "../components/parts/DealButton";
import ActionCard from "../components/ActionButton";
// import Cards (from your Desktop file)
import Cards from "../components/Cards";
import Download from "../components/Download";
import BestSection from "../components/bestsection";

import ForwardIcon from "@mui/icons-material/Forward";

import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Autoplay } from "swiper";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

function Home(props) {
  const router = useRouter();
  
  // City change modal state
  const [cityChangeModal, setCityChangeModal] = useState({
    show: false,
    currentCity: "",
    newCity: "",
  });

  // Initialize Swiper modules on client only
  useEffect(() => {
    if (typeof window !== "undefined") {
      SwiperCore.use([Autoplay, Navigation, Pagination]);
    }
  }, []);

  // City handling logic
  useEffect(() => {
    const getCityFromPath = () => {
      const path = router.asPath;
      if (path === '/') return null;
      const cityFromPath = decodeURIComponent(path.substring(1));
      return cityFromPath;
    };

    const urlCity = getCityFromPath();
    const cookieCity = Cookies.get('city');

    console.log("URL City from path:", urlCity);
    console.log("Cookie City:", cookieCity);

    // Case 1: Home page with city cookie
    if (!urlCity && cookieCity) {
      router.push(`/${cookieCity}`, undefined, { shallow: true });
      return;
    }

    // Case 2: Different city than cookie city
    if (urlCity && cookieCity && urlCity !== cookieCity) {
      setCityChangeModal({
        show: true,
        currentCity: cookieCity,
        newCity: urlCity,
      });
      return;
    }

    // Case 3: City page with no cookie
    if (urlCity && !cookieCity) {
      Cookies.set('city', urlCity, { expires: 365, path: '/' });
    }
  }, [router.asPath]);

  // Handle city change confirmation
  const handleCityChangeConfirm = () => {
    Cookies.set('city', cityChangeModal.newCity, { expires: 365, path: '/' });
    setCityChangeModal({ show: false, currentCity: "", newCity: "" });
    // Optionally reload the page or update state
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // Handle city change cancellation
  const handleCityChangeCancel = () => {
    router.push(`/${cityChangeModal.currentCity}`, undefined, { shallow: true });
    setCityChangeModal({ show: false, currentCity: "", newCity: "" });
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cats, setCats] = useState([]);
  const [mainCats, setMainCats] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [realestates, setRealestates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [title1, setTitle1] = useState("");
  const [title2, setTitle2] = useState("");
  const [title3, setTitle3] = useState("");
  const [collection1, setCollection1] = useState([]);
  const [collection2, setCollection2] = useState([]);
  const [collection3, setCollection3] = useState([]);
  const [theCity, setTheCity] = useState("");
  const [theNeighborhoods, setTheNeighborhoods] = useState([]);

  const [isHaveFavorited, setIsHaveFavorited] = useState(false);
  const [isHaveHistory, setIsHaveHistory] = useState(false);

  const [favoriteWorkers, setFavoriteWorkers] = useState([]);
  const [historyWorkers, setHistoryWorkers] = useState([]);
  const [clickedAction, setClickedAction] = useState(null);
  const [showVpnDialog, setShowVpnDialog] = useState(false);
  const [vpnChecked, setVpnChecked] = useState(false);

  const homepageCardsFeatures = [
    {
      id: 1,
      title: "خرید",
      description: "آگهی‌های خرید ملک، خانه و آپارتمان",
      illustration: "/img/card1.png",
      action: "مشاهده آگهی‌ها",
      onClick: () => selectAction("buy"),
    },
    {
      id: 2,
      title: "ثبت آگهی",
      description: "ملک خود را برای فروش یا اجاره در آجر ثبت کنید",
      illustration: "/img/card2.png",
      action: "ثبت آگهی",
      onClick: () => router.push("/panel/new"),
    },
    {
      id: 3,
      title: "اجاره",
      description: "آگهی‌های اجاره مسکونی، تجاری و اداری",
      illustration: "/img/card3.png",
      action: "مشاهده آگهی‌ها",
      onClick: () => selectAction("rent"),
    },
  ];

  // Simplified visibility control
  const selectAction = useCallback((type) => {
    setClickedAction(type);
  }, []);

  const clearAction = useCallback(() => {
    setClickedAction(null);
  }, []);

  // Lightweight VPN/proxy detection
  const detectVpn = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch("https://ipapi.co/json/", {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) return false;
      const data = await res.json();

      const org = (data.org || data.asn || "").toString().toLowerCase();
      const vpnKeywords = [
        "vpn", "proxy", "expressvpn", "nordvpn", "surfshark",
        "digitalocean", "amazon", "google cloud", "microsoft",
        "linode", "hetzner", "ovh", "vultr", "cloudflare"
      ];

      for (const k of vpnKeywords) {
        if (org.includes(k)) return true;
      }

      return false;
    } catch (e) {
      console.warn('VPN detection failed', e);
      return false;
    }
  }, []);

  useEffect(() => {
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
  }, [detectVpn]);

  // Main data fetching effect
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.error("Loading timeout - showing error state");
        setLoading(false);
        setError(true);
      }
    }, 15000);

    const selectedCity = props.trigeredcity || props.url_city || "رباط کریم";

    const fetchData = async () => {
      try {
        const response = await axios({
          method: "get",
          url: "https://api.ajur.app/api/base",
          params: { city: selectedCity },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        
        setCats(response.data.cats || []);
        setTheCity(response.data.the_city || "");
        setTheNeighborhoods(response.data.the_neighborhoods || []);
        setMainCats(response.data.main_cats || []);
        setSubCats(response.data.sub_cats || []);
        setRealestates(response.data.realstates || []);
        setDepartments(response.data.departments || []);
        setTitle1(response.data.title1 || "");
        setTitle2(response.data.title2 || "");
        setTitle3(response.data.title3 || "");
        setCollection1(response.data.collection1 || []);
        setCollection2(response.data.collection2 || []);
        setCollection3(response.data.collection3 || []);

        setLoading(false);
        setError(false);
      } catch (error) {
        if (axios.isCancel(error)) return;
        
        clearTimeout(timeoutId);
        console.error("API request failed:", error);
        setLoading(false);
        setError(true);
      }
    };

    fetchData();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [props.trigeredcity, props.url_city]);

  // Fetch favorite workers
  useEffect(() => {
    const fetchFavoriteWorkers = async () => {
      const favorited = Cookies.get("favorited");
      if (!favorited) return;

      try {
        const response = await axios({
          method: "get",
          url: "https://api.ajur.app/api/history-workers",
          params: { workers_holder: JSON.parse(favorited) },
        });

        setFavoriteWorkers(response.data || []);
        setIsHaveFavorited(response.data?.length > 0);
      } catch (error) {
        console.error("Error loading favorite workers:", error);
        setIsHaveFavorited(false);
      }
    };

    fetchFavoriteWorkers();
  }, []);

  // Fetch history workers
  useEffect(() => {
    const fetchHistoryWorkers = async () => {
      const history = Cookies.get("history");
      if (!history) return;

      try {
        const response = await axios({
          method: "get",
          url: "https://api.ajur.app/api/history-workers",
          params: { workers_holder: JSON.parse(history) },
        });

        setHistoryWorkers(response.data || []);
        setIsHaveHistory(response.data?.length > 0);
      } catch (error) {
        console.error("Error loading history workers:", error);
        setIsHaveHistory(false);
      }
    };

    fetchHistoryWorkers();
  }, []);

  const alterLoading = useCallback(() => {
    setLoading(prev => !prev);
  }, []);

  const renderDefaultCity = useCallback(() => {
    return "رباط کریم";
  }, []);

  // Render functions
  const renderSliderCategories = useCallback(() => {
    const selectedCity = props.trigeredcity || renderDefaultCity();
    
    return mainCats.map((cat) => (
      <SwiperSlide
        key={cat.id}
        onClick={alterLoading}
        className={styles["single_cat_swipper"]}
      >
        <Link 
          href={`/${encodeURIComponent(selectedCity)}/${encodeURIComponent(cat.eng_name)}`}
          legacyBehavior
        >
          <a>
            <MainCatCard cat={cat} />
          </a>
        </Link>
      </SwiperSlide>
    ));
  }, [mainCats, props.trigeredcity, alterLoading, renderDefaultCity]);

  const renderWorkerSlider = useCallback((workers) => {
    return workers.map((worker) => (
      <SwiperSlide key={worker.id} onClick={alterLoading}>
        <Link href={`/worker/${worker.id}?slug=${worker.slug}`} legacyBehavior>
          <a>
            <WorkerCard worker={worker} />
          </a>
        </Link>
      </SwiperSlide>
    ));
  }, [alterLoading]);

  const renderSliderDepartments = useCallback(() => {
    return departments.map((department) => (
      <SwiperSlide key={department.id} onClick={alterLoading}>
        <Link href={`/department/${department.id}?slug=${department.slug}`} legacyBehavior>
          <a>
            <DepartmentSmalCard department={department} />
          </a>
        </Link>
      </SwiperSlide>
    ));
  }, [departments, alterLoading]);

  const renderSliderRealState = useCallback(() => {
    return realestates.map((realstate) => (
      <SwiperSlide key={realstate.id} onClick={alterLoading}>
        <Link href={`/realestates/${realstate.id}?slug=${realstate.slug}`} legacyBehavior>
          <a>
            <RealStateSmalCard realstate={realstate} />
          </a>
        </Link>
      </SwiperSlide>
    ));
  }, [realestates, alterLoading]);

  const handleRecentsClick = useCallback(() => {
    router.push("/recents");
  }, [router]);

  const handleFavoritesClick = useCallback(() => {
    router.push("/favorites");
  }, [router]);

  const renderHistoryWorkers = useCallback(() => {
    if (historyWorkers.length === 0) return null;

    return (
      <div style={{ paddingBottom: 10 }}>
        <div className={styles["title"]}>
          <h2 onClick={handleRecentsClick}>آخرین بازدید های شما</h2>
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
            200: { slidesPerView: 1, spaceBetween: 20 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1050: { slidesPerView: 3, spaceBetween: 20 },
            1400: { slidesPerView: 4, spaceBetween: 20 },
          }}
          modules={[Pagination, Navigation, Autoplay]}
          className={styles["worker-swiper"]}
        >
          {renderWorkerSlider(historyWorkers)}
        </Swiper>
      </div>
    );
  }, [historyWorkers, handleRecentsClick, renderWorkerSlider]);

  const renderFavoriteWorkers = useCallback(() => {
    if (favoriteWorkers.length === 0) return null;

    return (
      <div style={{ paddingBottom: 20 }}>
        <div className={styles["title"]}>
          <h2 onClick={handleFavoritesClick}>آخرین مورد پسند های شما</h2>
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
            200: { slidesPerView: 1, spaceBetween: 2 },
            640: { slidesPerView: 2, spaceBetween: 3 },
            1050: { slidesPerView: 3, spaceBetween: 20 },
            1400: { slidesPerView: 4, spaceBetween: 20 },
          }}
          modules={[Pagination, Navigation, Autoplay]}
          className={styles["worker-swiper"]}
        >
          {renderWorkerSlider(favoriteWorkers)}
        </Swiper>
      </div>
    );
  }, [favoriteWorkers, handleFavoritesClick, renderWorkerSlider]);

  const renderOrSpinner = useCallback(() => {
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
        <div className="spinnerImageView" style={{ textAlign: 'center', padding: '100px 0' }}>
          <Image
            src="/logo/ajour-gif.gif"
            alt="ajur logo"
            width={1152}
            height={648}
          />
        </div>
      );
    }

    return (
      <div>
        <main className={styles["main"]}>
          {/* Header Title Above Cards */}
          <div className={`max-w-7xl mx-auto mt-10 mb-1 text-center iransans ${styles.headerTitleHover}`}>
            <h1 className="iransans-heading text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
              <span className="text-red-600">آجر</span>، مشاور املاک هوشمند
            </h1>
          </div>
          
          <Cards features={homepageCardsFeatures} />

          {/* Services heading */}
          <div className="max-w-7xl mx-auto my-6 text-center iransans">
            <h1 className="iransans-heading text-3xl md:text-4xl font-bold">خدمات آجر</h1>
          </div>

          {/* Quick access / features hub */}
           <FeaturesHub />

          <div className="max-w-7xl mx-auto my-6 pt-14 text-center iransans">
            <h1 className="iransans-heading text-3xl md:text-4xl font-bold">بهترین‌های آجر</h1>
          </div>

          <BestSection /> 

          {/* FileRequest section */}
          <FileRequest
            onCallClick={() => (window.location.href = "tel:+989382740488")}
            onActionClick={() => router.push("/file-request")}
          />

          {/* Download section */}
          <Download />

          {/* Modal for subcategories */}
          {(clickedAction === "buy" || clickedAction === "rent") && (
            <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 mt-5 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm z-10">
                <button
                  onClick={clearAction}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
                  aria-label="بازگشت"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M20 12 H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M9 7 L4 12 L9 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="mr-2 text-sm font-medium">بازگشت</span>
                </button>

                <div className="text-xl font-bold text-gray-900">
                  {clickedAction === "buy" ? "دسته‌بندی‌های خرید" : "دسته‌بندی‌های اجاره"}
                </div>

                <button
                  onClick={clearAction}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="بستن"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Subcategories Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 max-w-6xl mx-auto px-4 sm:px-6">
                  {subCats
                    .filter((c) => clickedAction === "buy" ? c.type === "sell" : c.type === "rent")
                    .map((cat, idx) => (
                     
                       <DealButton
                        key={cat.id}
                        title={cat.name}
                        src={`/cats_image/sub-cats/${cat.id}.png`}
                        onClick={() => {
                          setLoading(true);
                          const city = props.trigeredcity || renderDefaultCity();
                          router.push(
                            `/${encodeURIComponent(city)}/${encodeURIComponent(cat.eng_name)}`
                          );
                        }}
                        style={{ animationDelay: `${idx * 70}ms` }}
                      />
                     
                    ))}
                </div>
              </div>
            </div>
          )}

          <div className={styles["main-row"]}>
            {renderHistoryWorkers()}
            {renderFavoriteWorkers()}
          </div>
        </main>
      </div>
    );
  }, [error, loading, homepageCardsFeatures, clickedAction, subCats, props.trigeredcity, router, clearAction, renderDefaultCity, renderHistoryWorkers, renderFavoriteWorkers]);

  return (
    <div className={styles.container}>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="robots" content="max-image-preview:large" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <title>آجر : مشاور املاک هوشمند</title>
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
        <meta property="og:title" content="آجر : مشاور املاک هوشمند" />
        <meta
          property="og:description"
          content="از خرید و فروش خانه و ویلا تا مشاوره برای سرمایه گزاری در مشاور املاک هوشمند آجر"
        />
        <meta property="og:url" content="https://ajur.app" />
        <meta property="og:site_name" content="آجر : مشاور املاک هوشمند" />
        <meta property="og:image" content="https://ajur.app/logo/ajour-meta-image.jpg" />
        <meta property="og:image:width" content="1080" />
        <meta property="og:image:height" content="702" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://ajur.app" />
      </Head>

      {/* City Change Confirmation Modal */}
      <CityChangeAlertDialog
        open={cityChangeModal.show}
        onClose={handleCityChangeCancel}
        onConfirm={handleCityChangeConfirm}
        currentCity={cityChangeModal.currentCity}
        newCity={cityChangeModal.newCity}
      />

      {/* VPN warning dialog */}
      {showVpnDialog && (
        <Dialog
          open={showVpnDialog}
          onClose={(event, reason) => {
            if (reason === "backdropClick") return;
            setShowVpnDialog(false);
          }}
          hideBackdrop
          disableEnforceFocus
          disableAutoFocus
          ModalProps={{
            style: { pointerEvents: "none" },
          }}
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
          }}
        >
          <DialogContent>
            برای استفاده بهتر از آجر، لطفا فیلترشکن خود را خاموش کنید
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                const now = new Date();
                const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                Cookies.set("hide_vpn_warning", "1", { expires: endOfDay });
                setShowVpnDialog(false);
              }}
              color="primary"
            >
              بستن
            </Button>
            <Button
              onClick={() => {
                Cookies.set("hide_vpn_warning", "1", { expires: 365 });
                setShowVpnDialog(false);
              }}
              color="primary"
            >
              دیگر نمایش نده
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <main className={`${styles.main} iransans`}>
        {renderOrSpinner()}
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { query } = context;
  const city = query.city || null;

  return {
    props: {
      url_city: city,
    },
  };
}

export default Home;