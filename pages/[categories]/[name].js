import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import Head from "next/head";
import Styles from "../../styles/CategoriesWorkersIndex.module.css";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import WorkerCard from "../../components/cards/WorkerCard";
import Link from "next/link";
import WorkerFilter from "../../components/WorkerFilter";
import { CityContext } from '../../components/parts/CityContext';

import {
  useMediaQuery,
  useTheme,
} from "@mui/material";

// Import MUI components for breadcrumb
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// Import utility function for city names
import { getPersianCityName } from '../../components/util/cityNames';

const SingleCategory = (props) => {
  const router = useRouter();
  const { currentCity } = useContext(CityContext);
  const { slug, id, categories, subcat, neighbor } = router.query;
  const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // Directly use props where possible to avoid unnecessary state
  const workers = useMemo(() => props.workers || [], [props.workers]);
  const details = useMemo(() => props.details || {}, [props.details]);
  const main_cats = useMemo(() => props.main_cats || [], [props.main_cats]);
  const neighborhoods = useMemo(() => props.neighborhoods || [], [props.neighborhoods]);
  const name = props.name || '';
  const city = props.city || 'tehran';
  const persian_city = props.persian_city || getPersianCityName(props.city || 'tehran');
  const persian_category_name = props.persian_category_name || name || ''; // ADD THIS LINE
  
  // State for UI
  const [loading, set_loading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [y_scroll, set_y_scroll] = useState(0);
  const [workersState, set_workers] = useState(workers);
  const [pagination, setPagination] = useState(props.pagination || { current_page: 1, per_page: 10, total_count: 0, total_pages: 1 });
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(props.error || false);
  const [errorMessage, setErrorMessage] = useState(props.errorMessage || '');
  const [initialNeighborhood, setInitialNeighborhood] = useState(null);

  // Derived values
  const hasMore = useMemo(() => {
    return pagination.current_page < pagination.total_pages;
  }, [pagination]);

  // Update workers when props change
  useEffect(() => {
    set_workers(workers);
  }, [workers]);

  // Initialize component
  useEffect(() => {
    if (props.workers !== undefined) {
      set_loading(false);
    }

    // Handle neighborhood from URL query
    if (props.neighbor && neighborhoods.length > 0) {
      const neighborhoodObj = neighborhoods.find(
        (n) => n.name === props.neighbor
      );
      if (neighborhoodObj) {
        setInitialNeighborhood(neighborhoodObj);
      }
    }
  }, [props.workers, props.neighbor, neighborhoods]);

  useEffect(() => {
    const handleScroll = () => {
      set_y_scroll(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleCategoryChange = (newCategory) => {
    if (newCategory) {
      router.push({
        pathname: `/${city}/${newCategory.eng_name}`,
      });
    } else {
      router.push(`/${city}`);
    }
  };

  // Load more workers on scroll - optimized with useCallback
  const loadMoreWorkers = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = pagination.current_page + 1;

    try {
      // Build query with all current filters from URL
      const query = { ...router.query, page: nextPage.toString() };
      
      // Call serverFilteredWorkers API for next page
      let apiUrl = `https://api.ajur.app/api/server-filtered-workers?catname=${name}&city=${city}&page=${nextPage}&per_page=${pagination.per_page}`;
      
      // Add all filter parameters
      if (query.categoryId) apiUrl += `&category_id=${query.categoryId}`;
      if (query.features) apiUrl += `&features=${query.features}`;
      if (query.neighborhoods) apiUrl += `&neighborhoods=${query.neighborhoods}`;
      
      if (query.sortBy && query.sortBy !== 'newest') {
        const sortMap = {
          'newest': 'created_at_desc',
          'oldest': 'created_at_asc',
          'most_viewed': 'total_view_desc'
        };
        const [field, order] = sortMap[query.sortBy]?.split('_') || ['created_at', 'desc'];
        apiUrl += `&sort_by=${field}&sort_order=${order}`;
      }
      
      // Add range filters
      Object.keys(query).forEach(key => {
        if (key.includes('_min') || key.includes('_max')) {
          apiUrl += `&${key}=${query[key]}`;
        }
      });

      console.log('📡 Loading more from API:', apiUrl);
      
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`API failed: ${res.status}`);
      
      const data = await res.json();
      
      // Append new workers, avoiding duplicates
      set_workers(prev => {
        const existingIds = new Set(prev.map(w => w.id));
        const newWorkers = (data.workers || []).filter(w => !existingIds.has(w.id));
        return [...prev, ...newWorkers];
      });
      
      // Update pagination
      setPagination(data.pagination || {
        current_page: nextPage,
        per_page: pagination.per_page,
        total_count: data.pagination?.total_count || pagination.total_count,
        total_pages: data.pagination?.total_pages || pagination.total_pages
      });
      
    } catch (error) {
      console.error('Error loading more workers:', error);
      setError(true);
      setErrorMessage('خطا در بارگذاری اطلاعات بیشتر');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, pagination, name, city, router.query]);

  // Handle scroll for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;
      
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      
      // Load more when user is 300px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        loadMoreWorkers();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, hasMore, loadMoreWorkers]);

  // Error retry function
  const retryLoading = () => {
    set_loading(true);
    setError(false);
    router.reload();
  };

  const renderWorkers = () => {
    if (error) {
      return (
        <Grid item xs={12} style={{ textAlign: "center", padding: "40px 20px" }}>
          <Alert 
            severity="error"
            style={{ marginBottom: 20 }}
            action={
              <Button color="inherit" size="small" onClick={retryLoading}>
                تلاش مجدد
              </Button>
            }
          >
            {errorMessage || 'خطا در بارگذاری اطلاعات'}
          </Alert>
          <Button
            variant="contained"
            onClick={retryLoading}
            style={{
              backgroundColor: "#b92a31",
              color: "white",
              padding: "10px 30px",
            }}
          >
            تلاش مجدد
          </Button>
        </Grid>
      );
    }

    if (filterLoading) {
      return (
        <Grid item xs={12} style={{ textAlign: "center", padding: "40px 0" }}>
          <img
            src="/logo/ajour-gif.gif"
            alt="در حال فیلتر کردن"
            style={{ height: "60px", width: "auto" }}
          />
          <p style={{ marginTop: "10px", color: "#666" }}>در حال فیلتر کردن نتایج...</p>
        </Grid>
      );
    }

    if (workersState && workersState.length > 0) {
      return (
        <>
          {workersState.map((worker) => (
             <Grid 
             item 
             xs={12} 
             sm={6} // Changed from md={4} to better responsive layout
             md={4} 
             key={worker.id}
             sx={{ 
               display: 'flex',
               justifyContent: 'center'
             }}
           >
            
             <a
               href={`/worker/${worker.id}?slug=${worker.slug}`}
               key={worker.id}
               style={{ 
                 width: '100%',
                 textDecoration: 'none'
               }}
             >
               <WorkerCard worker={worker} />
             </a>
           </Grid>

          ))}
          
          {/* Load More Button/Indicator */}
          {hasMore && (
            <Grid item xs={12} style={{ textAlign: "center", padding: "30px 0" }}>
              {loadingMore ? (
                <CircularProgress size={30} style={{ color: "#b92a31" }} />
              ) : (
                <Button
                  variant="outlined"
                  onClick={loadMoreWorkers}
                  style={{
                    color: "#b92a31",
                    borderColor: "#b92a31",
                    padding: "10px 30px",
                  }}
                >
                  نمایش بیشتر
                </Button>
              )}
            </Grid>
          )}
          
          {!hasMore && workersState.length > 0 && (
            <Grid item xs={12} style={{ textAlign: "center", padding: "20px 0", color: "#666" }}>
              همه نتایج بارگذاری شدند
            </Grid>
          )}
        </>
      );
    } else {
      return (
        <Grid item md={12} xs={12} style={{ background: "white" }}>
          <p style={{ textAlign: "center", padding: 20 }}>
            متاسفانه موردی یافت نشد
          </p>
          <div className="not-found-wrapper">
            <img
              className="not-found-image"
              src="/logo/not-found.png"
              alt="ملکی پیدا نشد"
              width={200}
              height={120}
            />
          </div>
        </Grid>
      );
    }
  };

  // Add breadcrumb component
  const renderBreadcrumb = () => {
    const displayName = persian_category_name || name || ''; // USE THIS
    const cityName = persian_city || city;
    
    return (
      <div style={{ 
        padding: "15px 20px",  
        paddingTop: isMobile ? '70px' : '1px',
        backgroundColor: "white",
        marginBottom: "20px",
        marginTop: "20px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <Breadcrumbs 
          aria-label="breadcrumb"
          separator="›"
          style={{ 
            direction: "rtl",
            fontFamily: "Vazir, Arial, sans-serif",
          }}
        >
          <Link href="/" passHref>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              color: "#666",
              textDecoration: "none",
              cursor: "pointer",
              fontSize: "14px"
            }}>
              <HomeIcon style={{ fontSize: "16px", marginLeft: "5px" }} />
              خانه
            </div>
          </Link>
          
          <Link href={`/${city}`} passHref>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              color: "#666",
              textDecoration: "none",
              cursor: "pointer",
              fontSize: "14px"
            }}>
              <LocationOnIcon style={{ fontSize: "16px", marginLeft: "5px" }} />
              {cityName}
            </div>
          </Link>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            color: "#b92a31",
            fontWeight: "500",
            fontSize: "14px"
          }}>
            <CategoryIcon style={{ fontSize: "16px", marginLeft: "5px" }} />
            {displayName}
          </div>
        </Breadcrumbs>
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div
        className={y_scroll > 250 ? Styles["header-wrapper"] : ""}
        style={{
          padding: y_scroll > 250 ? "10px 0" : "0",
          backgroundColor: "white",
        }}
      >
        <Box sx={{ flexGrow: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <WorkerFilter
                workers={workersState}
                onFilteredWorkersChange={set_workers}
                onLoadingChange={setFilterLoading}
                initialCategory={{
                  id: details?.id,
                  name: persian_category_name,
                  value: details?.name
                }}
                onCategoryChange={handleCategoryChange}
                initialNeighborhood={initialNeighborhood}
                city={city}
                appliedFilters={props.appliedFilters || {}}
              />
            </Grid>
          </Grid>
        </Box>
      </div>
    );
  };

  const renderOrSpinner = () => {
    if (!loading && details) {
      return (
        <div>
          <div className={Styles["realstate-items-wrapper"]}>
            <div className={Styles["main-wrapper"]}>
              {/* Add breadcrumb here */}
              {renderBreadcrumb()}
              
              {renderHeader()}
              <Box sx={{ flexGrow: 1, py: 3, px: { xs: 2, sm: 3 } }}> {/* Add padding on sides */}
  <Grid 
    container 
    spacing={{ xs: 2, sm: 3 }} // Consistent spacing
    justifyContent={{ xs: "center", sm: "flex-start" }}
    sx={{
      margin: '0 auto',
      maxWidth: '100%'
    }}
  >
    {renderWorkers()}
  </Grid>
</Box>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="spinnerImageView">
          <img
            className="spinner-image"
            src="/logo/ajour-gif.gif"
            alt="ajur logo"
          />
        </div>
      );
    }
  };

  // Get SEO data from props
  const seoTitle = persian_category_name && persian_city 
    ? `${persian_category_name} در ${persian_city} | لیست ${persian_category_name} - آجر`
    : 'آجر | مشاور املاک هوشمند';
  
  const seoDescription = persian_category_name && persian_city 
    ? `لیست کامل ${persian_category_name} در ${persian_city} - مشاهده   ${persian_category_name} با قیمت‌های روز در آجر`
    : 'مشاور املاک هوشمند آجر ';
  
  const seoImage = details?.avatar 
    ? `https://api.ajur.app/cats_image/${details.avatar}.jpg`
    : 'https://api.ajur.app/logo/og-default.jpg';
  
  const seoUrl = name && city 
    ? `https://ajur.app/${city}/${name}`   
    : 'https://ajur.app';

  return (
    <div className="realstate-contents-wrapper">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        
        <title>{seoUrl}</title>
        {/* <title>{seoTitle}</title> */}
        
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={persian_category_name && persian_city 
          ? `${persian_category_name}, ${persian_city}, ${persian_category_name} در ${persian_city}, قیمت ${persian_category_name}`
          : 'مشاور املاک آجر , خرید ملک, فروش ملک, اجاره ملک'} />
        
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        {/* Open Graph */}
        <meta property="og:locale" content="fa_IR" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="مشاور املاک هوشمند آجر" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={seoUrl} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:alt" content={persian_category_name ? `تصویر ${persian_category_name}` : 'آجر - مشاور املاک هوشمند'} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={seoUrl} />
        
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* PWA Theme */}
        <meta name="theme-color" content="#b92a31" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Page-specific meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="author" content="آجر" />
        <meta property="article:author" content="آجر" />
        
        {persian_category_name && (
          <>
            <meta property="article:section" content={persian_category_name} />
            <meta property="article:tag" content={`${persian_category_name}, ${persian_city || city || ''}`} />
          </>
        )}
        
        {/* Geo tags for local SEO */}
        {city && (
          <>
            <meta name="geo.region" content={city === 'tehran' ? 'IR-TEH' : 'IR'} />
            <meta name="geo.placename" content={persian_city || city} />
          </>
        )}
        
        {/* Default Tehran coordinates for most cases */}
        <meta name="geo.position" content="35.6892;51.3890" />
        <meta name="ICBM" content="35.6892, 51.3890" />
      </Head>
      
      {renderOrSpinner()}
    </div>
  );
};

export async function getServerSideProps(context) {
  const { params, query } = context;

  const name = params.name; 
  const categories_city = params.categories;
  const city = categories_city ? categories_city : "tehran";
  
  // Extract filter parameters with pagination
  const subcat = query.subcat ? query.subcat : null;
  const categoryId = query.categoryId || null;
  const features = query.features || null;
  const neighborhoods = query.neighborhoods || null;
  const sortBy = query.sortBy || "newest";
  const page = query.page ? parseInt(query.page) : 1;
  const per_page = 10;
  
  // Extract range filters from query
  const rangeFilters = {};
  Object.keys(query).forEach(key => {
    if (key.includes('_min') || key.includes('_max')) {
      rangeFilters[key] = query[key];
    }
  });

  console.log('🔍 Server-side filtering for API:', {
    name,
    city,
    categoryId,
    features,
    neighborhoods,
    rangeFilters,
    sortBy,
    page,
    per_page
  });

  try {
    // Build API URL for serverFilteredWorkers endpoint
    let apiUrl = `https://api.ajur.app/api/server-filtered-workers?catname=${name}&city=${city}&page=${page}&per_page=${per_page}`;
    
    // Add filters to API call
    if (categoryId) apiUrl += `&category_id=${categoryId}`;
    if (features) apiUrl += `&features=${features}`;
    if (neighborhoods) apiUrl += `&neighborhoods=${neighborhoods}`;
    
    // Convert frontend sortBy to backend sort parameters
    if (sortBy && sortBy !== 'newest') {
      const sortMap = {
        'newest': 'created_at_desc',
        'oldest': 'created_at_asc',
        'most_viewed': 'total_view_desc'
      };
      const [field, order] = sortMap[sortBy]?.split('_') || ['created_at', 'desc'];
      apiUrl += `&sort_by=${field}&sort_order=${order}`;
    }
    
    // Add range filters
    Object.keys(rangeFilters).forEach(key => {
      apiUrl += `&${key}=${rangeFilters[key]}`;
    });
    
    console.log('🌐 Calling serverFilteredWorkers API:', apiUrl);
    
    // 🚀 PARALLEL API CALLS for better performance
    const [mainRes, baseRes] = await Promise.allSettled([
      fetch(apiUrl),
      fetch(`https://api.ajur.app/api/base?city=${city}`)
    ]);
    
    // Handle main API response
    if (mainRes.status === 'rejected' || !mainRes.value.ok) {
      throw new Error(`Main API failed: ${mainRes.status}`);
    }
    
    const data = await mainRes.value.json();
    
    // Get Persian names from API response
    const persian_category_name = data.filters_applied?.persian_category_name || name || 'تهران';
    const persianCityName = data.filters_applied?.persian_city || getPersianCityName(city);
    
    // Extract category details from main response
    const categoryDetails = data.filters_applied?.category_name ? {
      name: data.filters_applied.category_name,
      id: data.filters_applied.category_id
    } : {};
    
    // Handle base API response
    let neighborhoodsData = [];
    let main_cats = [];
    
    if (baseRes.status === 'fulfilled' && baseRes.value.ok) {
      const baseData = await baseRes.value.json();
      neighborhoodsData = baseData.the_neighborhoods || [];
      main_cats = baseData.cats || [];
    }
    
    return {
      props: {
        details: categoryDetails,
        workers: data.workers || [],
        main_cats: main_cats,
        name: name,
        city: city,
        persian_city: persianCityName,
        persian_category_name: persian_category_name, // FIXED: consistent naming
        neighborhoods: neighborhoodsData,
        subcat: subcat,
        // Pass applied filters back to client
        appliedFilters: {
          categoryId: categoryId,
          features: features,
          neighborhoods: neighborhoods,
          rangeFilters: rangeFilters,
          sortBy: sortBy
        },
        pagination: data.pagination || {
          current_page: page,
          per_page: per_page,
          total_count: 0,
          total_pages: 1
        },
        error: false,
        errorMessage: ''
      },
    };
  } catch (error) {
    console.error(`Error fetching workers data for ${name}:`, error);
    
    // Get fallback Persian city name
    const persianCityName = getPersianCityName(city);
    
    return {
      props: {
        error: true,
        errorMessage: 'خطا در ارتباط با سرور. لطفا دوباره تلاش کنید.',
        details: {},
        workers: [],
        main_cats: [],
        name: name,
        city: city,
        persian_city: persianCityName,
        persian_category_name: name || '', // ADD THIS TO ERROR CASE TOO
        neighborhoods: [],
        subcat: subcat,
        appliedFilters: {},
        pagination: {
          current_page: 1,
          per_page: 10,
          total_count: 0,
          total_pages: 1
        }
      }
    };
  }
}

SingleCategory.propTypes = {
  details: PropTypes.object,
  workers: PropTypes.array,
  main_cats: PropTypes.array,
  name: PropTypes.string,
  city: PropTypes.string,
  persian_city: PropTypes.string,
  persian_category_name: PropTypes.string, // ADD THIS
  neighborhoods: PropTypes.array,
  neighbor: PropTypes.string,
  subcat: PropTypes.string,
  appliedFilters: PropTypes.object,
  pagination: PropTypes.object,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
};

SingleCategory.defaultProps = {
  details: {},
  workers: [],
  main_cats: [],
  name: '',
  city: 'tehran',
  persian_city: 'تهران',
  persian_category_name: '', // ADD THIS
  neighborhoods: [],
  neighbor: null,
  subcat: null,
  appliedFilters: {},
  pagination: {
    current_page: 1,
    per_page: 10,
    total_count: 0,
    total_pages: 1
  },
  error: false,
  errorMessage: '',
};

export default SingleCategory;