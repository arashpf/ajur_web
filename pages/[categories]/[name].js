import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import Head from "next/head";
import Styles from "../../styles/CategoriesWorkersIndex.module.css";
import axios from "axios";
import CatCard2 from "../../components/cards/CatCard2";
import FileRequest from "../../components/request/FileRequest";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import WorkerCard from "../../components/cards/WorkerCard";
import Link from "next/link";
import { Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import LazyLoader from "../../components/lazyLoader/Loading";
import WorkerFilter from "../../components/WorkerFilter";

// Import MUI components for breadcrumb
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';

const SingleCategory = (props) => {
  const router = useRouter();
  const { slug, id, categories, subcat, neighbor } = router.query;


   // Log the props in browser console
   useEffect(() => {
    console.log('🌍 Browser Console - Page Props:');
    console.log('📍 City from props:', props.city);
    console.log('🏷️ Category name:', props.name);
    console.log('📊 Details:', props.details);
    console.log('👷 Workers count:', props.workers?.length);
    console.log('🔗 Current URL params:', router.query);
  }, [props, router.query]);



  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, set_loading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [name, set_name] = useState('');
  const [city, set_city] = useState('tehran');
  const [neighborhoods, set_neighborhoods] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [workers, set_workers] = useState([]);
  const [details, set_details] = useState({});
  const [all_workers, set_all_workers] = useState([]);
  const [cats, set_cats] = useState([]);
  const [main_cats, set_main_cats] = useState([]);
  const [y_scroll, set_y_scroll] = useState(0);

  const [showAllNeighborhoods, setShowAllNeighborhoods] = useState(false);
  const [initialNeighborhood, setInitialNeighborhood] = useState(null);

  useEffect(() => {
    window.addEventListener("scroll", changeHeader);
    return () => {
      window.removeEventListener("scroll", changeHeader);
    };
  }, []);

  const changeHeader = () => {
    set_y_scroll(window.scrollY);
  };

  // Add this function to handle category changes
  const handleCategoryChange = (newCategory) => {
    if (newCategory) {
      // Preserve all existing query parameters
      const query = {
        ...router.query, // Keep all existing query params
        name: newCategory.eng_name,
        id: newCategory.id,
      };

      // Redirect to the new category page with all parameters
      router.push({
        pathname: `/${city}/${newCategory.eng_name}`,
        query: query,
      });
    } else {
      // If category is cleared, redirect to main categories page
      router.push(`/${city}`);
    }
  };

  /* fetch single worker data and Images */
  useEffect(() => {
    // Set default values to prevent undefined errors
    set_workers(props.workers || []);
    set_all_workers(props.workers || []);
    setFilteredWorkers(props.workers || []);
    set_details(props.details || {});
    set_cats(props.subcategories || []);
    set_main_cats(props.main_cats || []);
    set_neighborhoods(props.neighborhoods || []);
    set_name(props.name || '');
    set_city(props.city || 'tehran');

    // Set loading to false once props are loaded
    if (props.workers !== undefined) {
      set_loading(false);
    }

    // Set the selected category from details
    if (props.details && props.details.id) {
      setSelectedCat({
        id: props.details.id,
        name: props.details.name,
      });
    }

    // Handle neighborhood from URL query
    if (props.neighbor && props.neighborhoods) {
      // Find the neighborhood object by name
      const neighborhoodObj = props.neighborhoods.find(
        (n) => n.name === props.neighbor
      );
      if (neighborhoodObj) {
        setInitialNeighborhood(neighborhoodObj);
      }
    }
  }, [props]);

  function AlterLoading() {
    set_loading(!loading);
  }

  function gotoOtherMainCatPage(cater) {
    router
      .replace({
        pathname: "/" + city + "/" + cater.name,
        query: { name: cater.name, city: city },
      })
      .then(() => router.reload());
  }

  const renderMainSliderCategories = () => {
    if (!main_cats || !Array.isArray(main_cats)) return null;
    
    return main_cats.map((cater) =>
      cater.id != details.parent_id ? (
        <div
          key={cater.id}
          style={{ cursor: "pointer" }}
          onClick={() => gotoOtherMainCatPage(cater)}
        >
          <a>
            <p
              style={{
                background: "#f1f1f1",
                textAlign: "center",
                color: "gray",
                padding: 20,
                borderRadius: "5px",
              }}
            >
              {cater.name}
            </p>
          </a>
        </div>
      ) : (
        <React.Fragment key={cater.id}></React.Fragment>
      )
    );
  };

  const renderWorkers = () => {
    if (filterLoading) {
      return (
        <Grid item xs={12} style={{ textAlign: "center", padding: "40px 0" }}>
          {/* <img
            src="/logo/ajour-gif.gif"
            alt="در حال فیلتر کردن"
            style={{ height: "60px", width: "auto" }}
          /> */}
          <p style={{ marginTop: "10px", color: "#666" }}>در حال فیلتر کردن نتایج...</p>
        </Grid>
      );
    }

    if (filteredWorkers && filteredWorkers.length > 0) {
      return (
        <LazyLoader
          items={filteredWorkers}
          itemsPerPage={8}
          delay={800}
          renderItem={(worker) => (
            <Grid item md={4} xs={12} key={worker.id}>
              <a
                href={`/worker/${worker.id}?slug=${worker.slug}`}
                key={worker.id}
              >
                <WorkerCard worker={worker} />
              </a>
            </Grid>
          )}
          loadingComponent={
            <p style={{ textAlign: "center" }}>در حال بارگذاری...</p>
          }
          endComponent={
            <p style={{ textAlign: "center" }}>همه آیتم‌ها بارگذاری شدند ✅</p>
          }
          grid={true}
          gridProps={{ spacing: 2 }}
          itemProps={{ xl: 3, md: 4, xs: 12 }}
        />
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
    const displayName = details?.name || name || '';
    
    return (
      <div style={{ 
        padding: "15px 20px", 
        backgroundColor: "white",
        marginBottom: "20px",
        marginTop: "30px",
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
              {city}
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
                workers={all_workers}
                onFilteredWorkersChange={setFilteredWorkers}
                onLoadingChange={setFilterLoading}
                initialCategory={selectedCat}
                onCategoryChange={handleCategoryChange}
                initialNeighborhood={initialNeighborhood}
                city={city}
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
              <Box sx={{ flexGrow: 1, py: 3, px: 3 }}>
                <Grid container spacing={2}>
                  {renderWorkers()}
                </Grid>
                <FileRequest />
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

  // Get SEO data from props (already available from server-side)
  const seoData = {
    title: props.details?.name && props.city 
      ? `${props.details.name} در ${props.city} | لیست ${props.details.name} - آجر`
      : 'آجر | مشاور املاک هوشمند',
    
    description: props.details?.name && props.city 
      ? `لیست کامل ${props.details.name} در ${props.city} - مشاهده اطلاعات تماس، آدرس و نمونه کارهای ${props.details.name} با قیمت‌های روز در آجر`
      : 'مشاور املاک هوشمند آجر - پیدا کردن بهترین متخصصان و خدمات در سراسر ایران',
    
    keywords: props.details?.name && props.city 
      ? `${props.details.name}, ${props.city}, ${props.details.name} در ${props.city}, استخدام ${props.details.name}, قیمت ${props.details.name}`
      : 'مشاور املاک, آجر, خرید ملک, فروش ملک, اجاره ملک',
    
    image: props.details?.avatar 
      ? `https://ajur.app/cats_image/${props.details.avatar}.jpg`
      : 'https://ajur.app/logo/og-default.jpg',
    
    url: props.details?.name && props.city 
      ? `https://ajur.app/${props.city}/${encodeURIComponent(props.details.name)}`
      : 'https://ajur.app',
  };

  return (
    <div className="realstate-contents-wrapper">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        
        {/* Use server-side props directly - no fallbacks for critical SEO tags */}
        <title>{seoData.title}</title>
        
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        {/* Open Graph */}
        <meta property="og:locale" content="fa_IR" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="مشاور املاک هوشمند آجر" />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content={seoData.url} />
        <meta property="og:image" content={seoData.image} />
        <meta property="og:image:alt" content={props.details?.name ? `تصویر ${props.details.name}` : 'آجر - مشاور املاک هوشمند'} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.image} />
        
        {/* Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": props.details?.name && props.city ? `لیست ${props.details.name} در ${props.city}` : 'لیست خدمات - آجر',
              "description": props.details?.name && props.city ? `صفحه لیست ${props.details.name} در شهر ${props.city}` : 'صفحه خدمات مشاور املاک آجر',
              "url": seoData.url,
              "numberOfItems": (props.workers || []).length,
              "itemListOrder": "https://schema.org/ItemListUnordered",
              "itemListElement": (props.workers || []).slice(0, 10).map((worker, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Service",
                  "name": worker.name || "متخصص",
                  "description": worker.description || `متخصص ${props.details?.name || ''}`,
                  "url": `https://ajur.app/worker/${worker.id}?slug=${worker.slug}`,
                  "provider": {
                    "@type": "Person",
                    "name": worker.name || "متخصص"
                  }
                }
              }))
            })
          }}
        />
        
        {/* Canonical URL */}
        <link rel="canonical" href={seoData.url} />
        
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
        
        {props.details?.name && (
          <>
            <meta property="article:section" content={props.details.name} />
            <meta property="article:tag" content={`${props.details.name}, ${props.city || ''}`} />
          </>
        )}
        
        {/* Geo tags for local SEO */}
        {props.city && (
          <>
            <meta name="geo.region" content={props.city === 'tehran' ? 'IR-TEH' : 'IR'} />
            <meta name="geo.placename" content={props.city} />
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
  const { params } = context;

  const name = params.name;
  const categories_city = params.categories;
  const city = categories_city ? categories_city : "tehran";
  const subcat = context.query.subcat ? context.query.subcat : null;
  const neighbor = context.query.neighbor ? context.query.neighbor : null;

  try {
    const res = await fetch(
      `https://api.ajur.app/api/main-category-workers?subcat=${subcat}&catname=${name}&city=${city}`
    );
    
    if (!res.ok) {
      // If API fails, show a proper error page or redirect
      return {
        notFound: true, // This will show a 404 page
      };
    }
    
    const data = await res.json();

    // Ensure required data exists
    if (!data.details || !data.details.name) {
      return {
        notFound: true,
      };
    }

    // Build SEO data server-side
    const seoTitle = `${data.details.name} در ${city} | لیست ${data.details.name} - آجر`;
    const seoDescription = `لیست کامل ${data.details.name} در ${city} - مشاهده اطلاعات تماس، آدرس و نمونه کارهای ${data.details.name} با قیمت‌های روز در آجر`;
    const seoKeywords = `${data.details.name}, ${city}, ${data.details.name} در ${city}, استخدام ${data.details.name}, قیمت ${data.details.name}`;
    const seoImage = data.details.avatar 
      ? `https://ajur.app/cats_image/${data.details.avatar}.jpg`
      : 'https://ajur.app/logo/ajour-meta-image.jpg';
    const seoUrl = `https://ajur.app/${city}/${encodeURIComponent(data.details.name)}`;

    return {
      props: {
        details: data.details,
        workers: data.workers || [],
        all_workers: data.workers || [],
        specials: data.specials || [],
        uppers: data.uppers || [],
        subcategories: data.subcategories || [],
        main_cats: data.main_cats || [],
        name: name,
        city: city,
        neighborhoods: data.the_neighborhoods || [],
        neighbor: neighbor,
        subcat: subcat,
        // Add SEO data as separate props for clarity
        seoData: {
          title: seoTitle,
          description: seoDescription,
          keywords: seoKeywords,
          image: seoImage,
          url: seoUrl,
        }
      },
    };
  } catch (error) {
    console.error(`Error fetching category data for ${name}:`, error);
    
    return {
      notFound: true,
    };
  }
}

SingleCategory.propTypes = {
  details: PropTypes.object,
  workers: PropTypes.array,
  all_workers: PropTypes.array,
  specials: PropTypes.array,
  uppers: PropTypes.array,
  subcategories: PropTypes.array,
  main_cats: PropTypes.array,
  name: PropTypes.string,
  city: PropTypes.string,
  neighborhoods: PropTypes.array,
  neighbor: PropTypes.string,
  subcat: PropTypes.string,
  seoData: PropTypes.object,
};

SingleCategory.defaultProps = {
  details: {},
  workers: [],
  all_workers: [],
  specials: [],
  uppers: [],
  subcategories: [],
  main_cats: [],
  name: '',
  city: 'tehran',
  neighborhoods: [],
  neighbor: null,
  subcat: null,
  seoData: {},
};

export default SingleCategory;