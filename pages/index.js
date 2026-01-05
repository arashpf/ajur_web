import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";

// Optimized dynamic imports
const SearchDiv = dynamic(() => import("../components/others/SearchDiv"), {
  ssr: false,
  loading: () => <div className="search-skeleton" />
});

const WorkerCard = dynamic(() => import("../components/cards/WorkerCard"), {
  ssr: false,
  loading: () => <div className="card-skeleton" />
});

const RealStateSmalCard = dynamic(() => import("../components/cards/realestate/RealStateSmalCard"), {
  ssr: false,
  loading: () => <div className="card-skeleton" />
});

const DepartmentSmalCard = dynamic(() => import("../components/cards/department/DepartmentSmalCard"), {
  ssr: false,
  loading: () => <div className="card-skeleton" />
});

const CatCard = dynamic(() => import("../components/cards/CatCard"), {
  ssr: false,
  loading: () => <div className="card-skeleton" />
});

const MainCatCard = dynamic(() => import("../components/cards/MainCatCard"), {
  ssr: false,
  loading: () => <div className="card-skeleton" />
});

const FileRequest = dynamic(() => import("../components/request/FileRequest"), {
  ssr: false,
  loading: () => <div className="section-skeleton" />
});

const CityChangeAlertDialog = dynamic(() => import("../components/dialogs/CityChangeAlertDialog"), {
  ssr: false
});

const FeaturesHub = dynamic(() => import("../components/accesshub"), {
  ssr: false,
  loading: () => <div className="hub-skeleton" />
});

const BestSection = dynamic(() => import("../components/bestsection"), {
  ssr: false,
  loading: () => <div className="section-skeleton" />
});

const Cards = dynamic(() => import("../components/Cards"), {
  ssr: false,
  loading: () => (
    <div className="max-w-7xl mx-auto my-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="card-skeleton h-64" />
        ))}
      </div>
    </div>
  )
});

const Download = dynamic(() => import("../components/Download"), {
  ssr: false,
  loading: () => <div className="section-skeleton h-40" />
});

const DealButton = dynamic(() => import("../components/parts/DealButton"), {
  ssr: false,
  loading: () => <div className="button-skeleton h-24" />
});

// Critical CSS inline
const criticalCSS = `
  /* Skeleton loaders */
  .search-skeleton,
  .card-skeleton,
  .section-skeleton,
  .hub-skeleton,
  .button-skeleton {
    background: linear-gradient(90deg, #f5f5f5 25%, #e8e8e8 50%, #f5f5f5 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s ease-in-out infinite;
    border-radius: 8px;
  }

  .search-skeleton {
    height: 56px;
    margin: 16px 0;
  }

  .card-skeleton {
    height: 280px;
    margin: 8px;
  }

  .section-skeleton {
    height: 200px;
    margin: 24px 0;
  }

  .hub-skeleton {
    height: 120px;
    margin: 24px 0;
  }

  .button-skeleton {
    height: 100px;
    margin: 8px;
  }

  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Performance optimizations */
  .above-the-fold {
    opacity: 0;
    animation: fade-in 0.3s ease forwards;
  }

  @keyframes fade-in {
    to { opacity: 1; }
  }
`;

function Home(props) {
  const router = useRouter();

  // useEffect(() => {
  //   console.log('Props received:', props);
  //   console.log('Router query:', router.query);
  //   console.log('Router path:', router.asPath);
  //   console.log('Selected city for API:', props.url_city);
  // }, [props, router]);
  
  // City change modal state
  const [cityChangeModal, setCityChangeModal] = useState({
    show: false,
    currentCity: "",
    newCity: "",
  });

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

  const [favoriteWorkers, setFavoriteWorkers] = useState([]);
  const [historyWorkers, setHistoryWorkers] = useState([]);
  const [clickedAction, setClickedAction] = useState(null);
  const [showVpnDialog, setShowVpnDialog] = useState(false);

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

  // Simple cookie utility
  const cookieUtils = {
    get: (name) => {
      if (typeof window === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    },
    set: (name, value, days = 365) => {
      if (typeof window === 'undefined') return;
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = `expires=${date.toUTCString()}`;
      document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
    }
  };

  // City handling logic
  useEffect(() => {
    const getCityFromPath = () => {
      const path = router.asPath;
      if (path === '/') return null;
      const cityFromPath = decodeURIComponent(path.substring(1));
      return cityFromPath;
    };

    const urlCity = getCityFromPath();
    const cookieCity = cookieUtils.get('city');

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
      cookieUtils.set('city', urlCity);
    }
  }, [router.asPath]);

  // Handle city change confirmation
  const handleCityChangeConfirm = () => {
    cookieUtils.set('city', cityChangeModal.newCity);
    setCityChangeModal({ show: false, currentCity: "", newCity: "" });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // Handle city change cancellation
  const handleCityChangeCancel = () => {
    router.push(`/${cityChangeModal.currentCity}`, undefined, { shallow: true });
    setCityChangeModal({ show: false, currentCity: "", newCity: "" });
  };

  // Main data fetching effect - FIXED JSON PARSE ERROR
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.error("Loading timeout - showing error state");
        setLoading(false);
        setError(true);
      }
    }, 10000);

    const selectedCity = props.url_city || "tehran";

    const fetchData = async () => {
      try {
        // console.log(`Fetching data for city: ${selectedCity}`);
        
        // Try cache first
        const cacheKey = `homeData_${selectedCity}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          // Use cache if less than 5 minutes old
          if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
            // console.log("Using cached data");
            setDataFromCache(parsed.data);
            setLoading(false);
            clearTimeout(timeoutId);
            return;
          }
        }

        // FIX: Use correct API endpoint and handle HTML responses
        const apiUrl = `https://api.ajur.app/api/base?city=${selectedCity}`;
        // console.log(`API URL: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        // console.log(`Response status: ${response.status}`);
        
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          // Response is not JSON, probably HTML error page
          const text = await response.text();
          console.error("Server returned non-JSON response:", text.substring(0, 200));
          throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error ${response.status}:`, errorText);
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        // console.log("API data received successfully");
        
        // Cache the data
        const cacheData = {
          timestamp: Date.now(),
          data: data
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
        
        setDataFromCache(data);
        setLoading(false);
        clearTimeout(timeoutId);
      } catch (error) {
        if (error.name === 'AbortError') {
          // console.log("Request aborted");
          return;
        }
        
        console.error("API request failed:", error);
        
        // Try to load from cache as fallback
        const cacheKey = `homeData_${selectedCity}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          // console.log("Using cached data as fallback");
          try {
            const parsed = JSON.parse(cachedData);
            setDataFromCache(parsed.data);
            setLoading(false);
          } catch (cacheError) {
            console.error("Cache parse error:", cacheError);
            setLoading(false);
            setError(true);
          }
        } else {
          // console.log("No cache available, showing error");
          setLoading(false);
          setError(true);
        }
        
        clearTimeout(timeoutId);
      }
    };

    const setDataFromCache = (data) => {
      // console.log("Setting data from cache/API:", data);
      setCats(data.cats || []);
      setTheCity(data.the_city || "");
      setTheNeighborhoods(data.the_neighborhoods || []);
      setMainCats(data.main_cats || []);
      setSubCats(data.sub_cats || []);
      setRealestates(data.realstates || []);
      setDepartments(data.departments || []);
      setTitle1(data.title1 || "");
      setTitle2(data.title2 || "");
      setTitle3(data.title3 || "");
      setCollection1(data.collection1 || []);
      setCollection2(data.collection2 || []);
      setCollection3(data.collection3 || []);
    };

    fetchData();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [props.url_city]);

  // Fetch favorite workers
  // useEffect(() => {
  //   const fetchFavoriteWorkers = async () => {
  //     const favorited = cookieUtils.get("favorited");
      
  //     if (!favorited) {
  //       setFavoriteWorkers([]);
  //       return;
  //     }
    
  //     try {
  //       // Parse the cookie with error handling
  //       let favoriteIds;
  //       try {
  //         favoriteIds = JSON.parse(favorited);
  //       } catch (parseError) {
  //         console.error("Error parsing favorites cookie:", parseError);
  //         // If cookie is corrupted, clear it and return empty
  //         cookieUtils.set("favorited", "[]");
  //         setFavoriteWorkers([]);
  //         return;
  //       }
    
  //       // Validate that favoriteIds is an array
  //       if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) {
  //         setFavoriteWorkers([]);
  //         return;
  //       }
    
  //       // Build the query parameter - ensure it's a proper JSON string
  //       const workersHolder = encodeURIComponent(JSON.stringify(favoriteIds));
  //       const apiUrl = `https://api.ajur.app/api/history-workers?workers_holder=${workersHolder}`;
        
  //       console.log("Fetching favorite workers from:", apiUrl);
    
  //       // Use AbortController for timeout
  //       const controller = new AbortController();
  //       const timeoutId = setTimeout(() => controller.abort(), 5000);
    
  //       const response = await fetch(apiUrl, {
  //         signal: controller.signal,
  //         headers: {
  //           'Accept': 'application/json',
  //           'Content-Type': 'application/json'
  //         }
  //       });
    
  //       clearTimeout(timeoutId);
    
  //       // Check response status
  //       if (!response.ok) {
  //         console.error(`API error ${response.status}: ${response.statusText}`);
  //         setFavoriteWorkers([]);
  //         return;
  //       }
    
  //       // Check content type
  //       const contentType = response.headers.get("content-type");
  //       if (!contentType || !contentType.includes("application/json")) {
  //         console.error("Invalid content type:", contentType);
  //         setFavoriteWorkers([]);
  //         return;
  //       }
    
  //       const data = await response.json();
        
  //       // Validate response data is an array
  //       if (!Array.isArray(data)) {
  //         console.error("API response is not an array:", data);
  //         setFavoriteWorkers([]);
  //         return;
  //       }
    
  //       console.log("Successfully loaded", data.length, "favorite workers");
  //       setFavoriteWorkers(data);
        
  //     } catch (error) {
  //       console.error("Error loading favorite workers:", error);
        
  //       // Differentiate between different types of errors
  //       if (error.name === 'AbortError') {
  //         console.error("Request timed out");
  //       } else if (error instanceof SyntaxError) {
  //         console.error("JSON parsing error - invalid JSON from API");
  //       }
        
  //       setFavoriteWorkers([]);
  //     }
  //   };

  //   if (!loading) {
  //     fetchFavoriteWorkers();
  //   }
  // }, [loading]);

  // Fetch history workers
  // useEffect(() => {
  //   const fetchHistoryWorkers = async () => {
  //     const history = cookieUtils.get("history");
      
  //     if (!history) {
  //       setHistoryWorkers([]);
  //       return;
  //     }
    
  //     try {
  //       // Parse the cookie with error handling
  //       let historyIds;
  //       try {
  //         historyIds = JSON.parse(history);
  //       } catch (parseError) {
  //         console.error("Error parsing history cookie:", parseError);
  //         // If cookie is corrupted, clear it and return empty
  //         cookieUtils.set("history", "[]");
  //         setHistoryWorkers([]);
  //         return;
  //       }
    
  //       // Validate that historyIds is an array
  //       if (!Array.isArray(historyIds) || historyIds.length === 0) {
  //         setHistoryWorkers([]);
  //         return;
  //       }
    
  //       // Build the query parameter - ensure it's a proper JSON string
  //       const workersHolder = encodeURIComponent(JSON.stringify(historyIds));
  //       const apiUrl = `https://api.ajur.app/api/history-workers?workers_holder=${workersHolder}`;
        
  //       // console.log("Fetching history workers from:", apiUrl);
    
  //       // Use AbortController for timeout
  //       const controller = new AbortController();
  //       const timeoutId = setTimeout(() => controller.abort(), 5000);
    
  //       const response = await fetch(apiUrl, {
  //         signal: controller.signal,
  //         headers: {
  //           'Accept': 'application/json',
  //           'Content-Type': 'application/json'
  //         }
  //       });
    
  //       clearTimeout(timeoutId);
    
  //       // Check response status
  //       if (!response.ok) {
  //         console.error(`API error ${response.status}: ${response.statusText}`);
  //         setHistoryWorkers([]);
  //         return;
  //       }
    
  //       // Check content type
  //       const contentType = response.headers.get("content-type");
  //       if (!contentType || !contentType.includes("application/json")) {
  //         console.error("Invalid content type:", contentType);
  //         setHistoryWorkers([]);
  //         return;
  //       }
    
  //       const data = await response.json();
        
  //       // Validate response data is an array
  //       if (!Array.isArray(data)) {
  //         console.error("API response is not an array:", data);
  //         setHistoryWorkers([]);
  //         return;
  //       }
    
  //       // console.log("Successfully loaded", data.length, "history workers");
  //       setHistoryWorkers(data);
        
  //     } catch (error) {
  //       console.error("Error loading history workers:", error);
        
  //       // Differentiate between different types of errors
  //       if (error.name === 'AbortError') {
  //         console.error("Request timed out");
  //       } else if (error instanceof SyntaxError) {
  //         console.error("JSON parsing error - invalid JSON from API");
  //       }
        
  //       setHistoryWorkers([]);
  //     }
  //   };

  //   if (!loading) {
  //     fetchHistoryWorkers();
  //   }
  // }, [loading]);

  // VPN detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (cookieUtils.get("hide_vpn_warning")) {
      return;
    }

    const detectVpn = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) return;
        
        // Check content type
        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          return;
        }
        
        const data = await res.json();

        const org = (data.org || data.asn || "").toString().toLowerCase();
        const vpnKeywords = [
          "vpn", "proxy", "expressvpn", "nordvpn", "surfshark"
        ];

        for (const k of vpnKeywords) {
          if (org.includes(k)) {
            setShowVpnDialog(true);
            return;
          }
        }
      } catch (e) {
        // Silent fail
      }
    };

    detectVpn();
  }, []);

  const renderDefaultCity = useCallback(() => {
    return "tehran";
  }, []);

  // Optimized loading spinner
  const renderSpinner = () => (
    <div className="spinnerImageView" style={{ 
      minHeight: "60vh", 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center",
      backgroundColor: "white"
    }}>
      <div style={{ 
        position: 'relative', 
        width: '120px', 
        height: '120px',
        marginBottom: '20px'
      }}>
        <Image
          src="/logo/ajour-gif.gif"
          alt="در حال بارگذاری"
          fill
          sizes="120px"
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
      <h2 style={{ 
        color: '#333', 
        marginTop: '20px',
        fontSize: '1.5rem',
        fontWeight: 'bold',
      }}>
        آجر - مشاور املاک هوشمند
      </h2>
      <p style={{ 
        color: '#666', 
        marginTop: '10px',
        fontSize: '0.9rem'
      }}>
        در حال بارگذاری...
      </p>
    </div>
  );

  // Optimized error state
  const renderError = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-4">
          <svg 
            className="w-10 h-10"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="5" y="9" width="3" height="6" rx="0.5" fill="#B45309" />
            <rect x="5.5" y="9.5" width="2" height="5" rx="0.3" fill="#F59E0B" />
            <rect x="16" y="9" width="3" height="6" rx="0.5" fill="#B45309" />
            <rect x="16.5" y="9.5" width="2" height="5" rx="0.3" fill="#F59E0B" />
            <circle cx="6.5" cy="10.5" r="0.6" fill="#7C2D12" />
            <circle cx="6.5" cy="12" r="0.6" fill="#7C2D12" />
            <circle cx="6.5" cy="13.5" r="0.6" fill="#7C2D12" />
            <circle cx="17.5" cy="10.5" r="0.6" fill="#7C2D12" />
            <circle cx="17.5" cy="12" r="0.6" fill="#7C2D12" />
            <circle cx="17.5" cy="13.5" r="0.6" fill="#7C2D12" />
            <line x1="8" y1="9" x2="16" y2="9" stroke="#92400E" strokeWidth="0.8" />
            <line x1="8" y1="15" x2="16" y2="15" stroke="#92400E" strokeWidth="0.8" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          مشکلی در بارگذاری داده‌ها پیش آمده است
        </h2>
        <p className="text-gray-600 max-w-md">
          متأسفانه در دریافت اطلاعات از سرور مشکل ایجاد شده است.
          لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.
        </p>
       
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#b92a31] text-white rounded-lg font-medium hover:bg-[#a0252c] transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          تلاش مجدد
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 border border-gray-300 flex items-center justify-center gap-2"
        >
          بازگشت
        </button>
      </div>
    </div>
  );

  // Render functions
  const renderWorkerSlider = useCallback((workers) => {
    if (!workers.length) return null;
    
    return workers.map((worker) => (
      <div key={worker.id} style={{ minWidth: '250px', margin: '0 10px' }}>
        <Link href={`/worker/${worker.id}?slug=${worker.slug}`}>
          <WorkerCard worker={worker} />
        </Link>
      </div>
    ));
  }, []);

  const renderHistoryWorkers = useCallback(() => {
    if (historyWorkers.length === 0) return null;

    return (
      <div style={{ paddingBottom: 10 }}>
        <div className={styles["title"]}>
          <h2 onClick={() => router.push("/recents")}>آخرین بازدید های شما</h2>
        </div>
        <div style={{ display: 'flex', overflowX: 'auto', padding: '10px 0' }}>
          {renderWorkerSlider(historyWorkers)}
        </div>
      </div>
    );
  }, [historyWorkers, renderWorkerSlider, router]);

  const renderFavoriteWorkers = useCallback(() => {
    if (favoriteWorkers.length === 0) return null;

    return (
      <div style={{ paddingBottom: 20 }}>
        <div className={styles["title"]}>
          <h2 onClick={() => router.push("/favorites")}>آخرین مورد پسند های شما</h2>
        </div>
        <div style={{ display: 'flex', overflowX: 'auto', padding: '10px 0' }}>
          {renderWorkerSlider(favoriteWorkers)}
        </div>
      </div>
    );
  }, [favoriteWorkers, renderWorkerSlider, router]);

  // Main content render
  const renderContent = () => (
    <div className="above-the-fold">
      <main className={styles["main"]}>
        {/* Header Title Above Cards */}
        <div className={`max-w-7xl mx-auto mt-6 mb-1 text-center ${styles.headerTitleHover}`}>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
            <span style={{ color: '#b92a31' }}>آجر</span>، مشاور املاک هوشمند
          </h1>
        </div>
        
        {/* Cards Section */}
        <Cards features={homepageCardsFeatures} />

        {/* Services heading */}
        <div className="max-w-7xl mx-auto my-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">خدمات آجر</h1>
        </div>

        {/* Features Hub */}
        <FeaturesHub />

        {/* Best section */}
        <div className="max-w-7xl mx-auto my-6 pt-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">بهترین‌های آجر</h1>
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

            <div className="p-2 md:p-4 lg:p-6">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 md:gap-4 max-w-6xl mx-auto px-3 md:px-6">
  {subCats
    .filter((c) => clickedAction === "buy" ? c.type === "sell" : c.type === "rent")
    .map((cat, idx) => (
      <div key={cat.id} className="aspect-square">
        <DealButton
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
      </div>
    ))}
</div>
</div>
          </div>
        )}

        {/* <div className={styles["main-row"]}>
          {renderHistoryWorkers()}
          {renderFavoriteWorkers()}
        </div> */}
      </main>
    </div>
  );

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/logo/ajour-gif.gif" as="image" />
        <link rel="preconnect" href="https://api.ajur.app" />
        <link rel="dns-prefetch" href="https://api.ajur.app" />
        
        {/* Critical CSS */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* SEO Meta Tags */}
        <title>آجر : مشاور املاک هوشمند</title>
        <meta
          name="description"
          content="مشاور املاک هوشمند آجر مشاور املاکی به وسعت ایران با صدها مشاور مسلط به منطقه"
        />
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
        
        {/* Open Graph */}
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
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="آجر : مشاور املاک هوشمند" />
        <meta name="twitter:description" content="مشاور املاک هوشمند آجر مشاور املاکی به وسعت ایران با صدها مشاور مسلط به منطقه" />
        <meta name="twitter:image" content="https://ajur.app/logo/ajour-meta-image.jpg" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://ajur.app" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* PWA */}
        <meta name="theme-color" content="#b92a31" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <div className={styles.container}>
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
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-gray-900">توجه</h3>
                <p className="mt-1 text-sm text-gray-600">برای استفاده بهتر از آجر، لطفاً فیلترشکن خود را خاموش کنید</p>
              </div>
              <button
                onClick={() => {
                  cookieUtils.set("hide_vpn_warning", "1", 1);
                  setShowVpnDialog(false);
                }}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {loading && renderSpinner()}
        {error && renderError()}
        {!loading && !error && renderContent()}
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { req, res, query } = context;
  
  // Set cache headers
  
  
  // const city = query.city || null; 
  const city = query.categories || 'tehran';
  const decodedCity = city ? decodeURIComponent(city) : 'tehran';

  console.log('----------------- City to use------------ :', decodedCity);

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=30, stale-while-revalidate=59'
  );

  // Test API connection on server side to verify it's working
  try {
    const testUrl = `https://api.ajur.app/api/base?city=${city || 'tehran'}`;
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || '',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Server-side API test failed: ${response.status}`);
    } else {
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        console.error("Server-side API returned non-JSON response");
      } else {
        // console.log("Server-side API test successful");
      }
    }
  } catch (error) {
    console.error("Server-side API test error:", error.message);
  }

  return {
    props: {
      url_city: city
    }
  };
}

export default Home;