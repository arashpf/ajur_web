import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import Head from "next/head";
import dynamic from "next/dynamic";
import axios from "axios";
import Cookies from "js-cookie";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DirectionsIcon from "@mui/icons-material/Directions";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Link from "next/link";

// Components - IMPORTANT: Enable SSR for critical components
const WorkerMedia = dynamic(() => import("../../components/workers/WorkerMedia"), {
  ssr: true, // Changed from false to true for better LCP
  loading: () => <div style={{ height: 400, backgroundColor: '#f5f5f5' }} />,
});

const WorkerDetails = dynamic(() => import("../../components/workers/WorkerDetails"), { 
  ssr: true, // Changed from false to true
  loading: () => <div style={{ height: 300, backgroundColor: '#f5f5f5' }} />,
});

// Keep non-critical components as non-SSR
const LocationNoSsr = dynamic(() => import("../../components/map/Location"), {
  ssr: false,
  loading: () => <div style={{ height: 300, backgroundColor: '#f5f5f5' }} />,
});

// Import other components
import WorkerCard from "../../components/cards/WorkerCard";
import WorkerRealstateCard from "../../components/cards/realestate/WorkerRealstateCard";
import WorkerShare from "../../components/workers/WorkerShare";
import LazyLoader from "../../components/lazyLoader/Loading";
import Breadcrumb from "../../components/common/Breadcrumb";

// Styles
import Styles from "../../components/styles/WorkerSingle.module.css";

// Helper function - defined outside component
const cleanText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/&[a-z]+;/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Create optimized Item component
const Item = React.memo(styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
})));

const WorkerSingle = (props) => {
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { slug, id } = router.query;

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // OPTIMIZATION: Memoize all cleaned data
  const { details, cleanRealstate, images, videos, virtual_tours, properties, relateds } = useMemo(() => {
    const {
      details: rawDetails,
      properties: rawProperties,
      realstate: rawRealstate,
      relateds: rawRelateds,
      images: rawImages,
      videos: rawVideos,
      virtual_tours: rawVirtualTours,
    } = props;

    const cleanedDetails = {
      ...rawDetails,
      name: cleanText(rawDetails.name || ''),
      category_name: cleanText(rawDetails.category_name || ''),
      region: cleanText(rawDetails.region || ''),
      city: cleanText(rawDetails.city || ''),
      neighbourhood: cleanText(rawDetails.neighbourhood || ''),
      address: cleanText(rawDetails.address || ''),
      description: cleanText(rawDetails.description || ''),
    };

    const cleanedRealstate = {
      ...rawRealstate,
      name: cleanText(rawRealstate?.name || ''),
      slug: rawRealstate?.slug || '',
    };

    return {
      details: cleanedDetails,
      cleanRealstate: cleanedRealstate,
      images: rawImages || [],
      videos: rawVideos || [],
      virtual_tours: rawVirtualTours || [],
      properties: rawProperties || [],
      relateds: rawRelateds || [],
    };
  }, [props]);

  // OPTIMIZATION: Split useEffect to reduce blocking time
  useEffect(() => {
    // Non-critical initialization (cookies, favorites) - can be deferred
    const timeoutId = setTimeout(() => {
      if (!isClient) return;
      
      try {
        // Check favorites
        const favorited = Cookies.get("favorited");
        if (favorited) {
          const favoriteItems = JSON.parse(favorited);
          setIsFavorite(favoriteItems.includes(details.id));
        }

        // Update browsing history
        let history = Cookies.get("history") || "[]";
        let historyItems = JSON.parse(history);
        historyItems = historyItems.filter((item) => item !== details.id);
        historyItems.push(details.id);

        if (historyItems.length > 10) {
          historyItems = historyItems.slice(-10);
        }

        Cookies.set("history", JSON.stringify(historyItems));
      } catch (error) {
        console.error("Cookie operation failed:", error);
      }
    }, 100); // Delay non-critical operations

    return () => clearTimeout(timeoutId);
  }, [details.id, isClient]);

  // OPTIMIZATION: Critical loading state - set false immediately for server-rendered content
  useEffect(() => {
    if (details && isClient) {
      // Small delay to ensure paint happens
      const timer = setTimeout(() => {
        setLoading(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [details, isClient]);

  // OPTIMIZATION: Memoize toggleFavorite
  const toggleFavorite = useCallback(() => {
    let favorited = Cookies.get("favorited") || "[]";
    let favoriteItems = JSON.parse(favorited);

    if (isFavorite) {
      favoriteItems = favoriteItems.filter((item) => item !== details.id);
    } else {
      if (!favoriteItems.includes(details.id)) {
        favoriteItems.push(details.id);
        if (favoriteItems.length > 20) {
          favoriteItems = favoriteItems.slice(-20);
        }
      }
    }

    Cookies.set("favorited", JSON.stringify(favoriteItems));
    setIsFavorite(!isFavorite);
  }, [isFavorite, details.id]);

  // OPTIMIZATION: Memoize SEO header
  const seoHeader = useMemo(() => {
    const metaDescription = details.description
      ? details.description.substring(0, 160)
      : `${details.name} - ${details.category_name} در ${details.region}, ${details.city}. مشاور منتخب برای مشاوره و راهنمایی در ${details.category_name}`;

    const cleanRealstateName = cleanText(cleanRealstate?.name || '');
    const keywords = `${details.name}, ${details.category_name}, ${details.city}, ${details.region}, ${details.neighbourhood}, مشاور, مشاوره, ${cleanRealstateName}`.trim();
    const pageTitle = details.name 
      ? `${details.name} - ${details.category_name} در ${details.region}, ${details.city} | آجر`
      : 'آجر | بازارگاه املاک و خدمات';

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: details.name,
      description: details.description || `${details.category_name} - ${details.name}`,
      image: details.thumb,
      url: `https://ajur.app/worker/${details.id}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: details.address || details.neighbourhood,
        addressRegion: details.region,
        addressLocality: details.city,
        addressCountry: "IR",
      },
      telephone: details.phone || "",
      areaServed: details.city,
      priceRange: details.price_range || "$$",
      category: details.category_name,
      department: cleanRealstateName,
      geo: {
        "@type": "GeoCoordinates",
        latitude: details.latitude || 0,
        longitude: details.longitude || 0,
      },
      sameAs: details.website ? [details.website] : [],
    };

    return (
      <Head>
        {/* Add preloads and performance hints */}
        <link rel="preconnect" href="https://api.ajur.app" />
        <link rel="dns-prefetch" href="https://api.ajur.app" />
        {details.thumb && (
          <link rel="preload" href={details.thumb} as="image" />
        )}
        
        <meta charSet="UTF-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta httpEquiv="Content-Language" content="fa" />
        <meta name="content-language" content="fa" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="format-detection" content="telephone=no" />
         
        {/* Primary Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={cleanRealstateName || "آجر"} />
        
        {/* Robots & Indexing */}
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
        <meta name="googlebot" content="index, follow, max-image-preview:large" />
        <meta name="language" content="fa-IR" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Open Graph (Social Media) */}
        <meta property="og:locale" content="fa_IR" />
        <meta property="og:locale:alternate" content="fa_IR" />
        <meta property="og:type" content="business.business" />
        <meta property="og:site_name" content="آجر - مشاور هوشمند" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={`https://ajur.app/worker/${details.id}`} />
        <meta property="og:image" content={details.thumb} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:alt" content={`${details.name} - ${details.category_name}`} />
        
        {/* Article Meta Tags */}
        {details.created_at && (
          <meta property="article:published_time" content={details.created_at} />
        )}
        {details.updated_at && (
          <meta property="article:modified_time" content={details.updated_at} />
        )}
        <meta property="article:author" content={cleanRealstateName || "آجر"} />
        <meta property="article:section" content={details.category_name} />
        <meta property="article:tag" content={details.city} />
        <meta property="article:tag" content={details.region} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={details.thumb} />
        <meta name="twitter:image:alt" content={`${details.name} - ${details.category_name}`} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://ajur.app/worker/${details.id}`} />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        
        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Critical CSS to prevent layout shift */}
        <style dangerouslySetInnerHTML={{ __html: `
          .worker-single-page .swiper {
            padding: 0 !important;
          }
          .media-wrapper, .worker-single-details {
            contain: layout style paint;
          }
          .map-container {
            min-height: 300px;
            background-color: #f5f5f5;
          }
          @media (max-width: 900px) {
            .sticky-call-button {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              z-index: 10001;
            }
          }
        `}} />
      </Head>
    );
  }, [details, cleanRealstate]);

  // OPTIMIZATION: Memoize related workers render
  const renderRelatedWorkers = useCallback(() => {
    if (!Array.isArray(relateds) || relateds.length === 0) {
      return <p>هیچ مورد مشابهی یافت نشد</p>;
    }

    return (
      <LazyLoader
        items={relateds}
        itemsPerPage={8}
        delay={800}
        renderItem={(worker) => (
          <Grid item md={4} xs={12} key={worker.id}>
            <Link 
              href={`/worker/${worker.id}?slug=${worker.slug}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              prefetch={false} // Disable prefetch for better performance
            >
              <WorkerCard worker={worker} />
            </Link>
          </Grid>
        )}
        loadingComponent={
          <p style={{ textAlign: "center" }}>در حال بارگذاری...</p>
        }
        endComponent={
          <p style={{ textAlign: "center" }}>همه موارد بارگذاری شدند</p>
        }
        grid={true}
        gridProps={{ spacing: 2 }}
        itemProps={{ xl: 3, md: 4, xs: 12 }}
      />
    );
  }, [relateds]);

  // OPTIMIZATION: Simplified loading state
  if (loading && isClient) {
    return (
      <div style={{ 
        minHeight: "60vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        backgroundColor: '#f5f5f5'
      }}>
        {/* Use simple CSS loader instead of GIF for faster load */}
        <div style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shine 1.5s infinite linear'
        }} />
        <style>{`
          @keyframes shine {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {seoHeader}

      <div 
        className={`${Styles["scroll-div"]} ${Styles["worker-single"]} worker-single-page`} 
        style={{ margin: "0 20px" }}
        // Add inert attribute to prevent focus during loading
        {...(loading ? { inert: true } : {})}
      >
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          persianCategory={details.category_name}
          englishCategory={details.category_eng_name}
          englishCity={details.city_slug}
          currentPage={details.name}
        />

        <Box sx={{ flexGrow: 1 }}>
          {/* Main Heading for SEO - hidden but accessible */}
          <div style={{ display: "none" }} aria-hidden="true">
            <h1>{details.name} - {details.category_name} در {details.region}, {details.city}</h1>
          </div>

          <Grid container spacing={1}>
            <Grid item xs={12} md={5}>
              <div className={Styles["media-wrapper"]}>
                <WorkerMedia
                  images={images}
                  videos={videos}
                  virtual_tours={virtual_tours}
                  loading={loading}
                />
                <div 
                  className={Styles["favorite-icon"]} 
                  onClick={toggleFavorite}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && toggleFavorite()}
                  aria-label={isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
                >
                  {isFavorite ? (
                    <FavoriteIcon style={{ color: "#b92a31" }} />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </div>
              </div>

              {/* Map - Desktop Only */}
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <div className={Styles["title"]}>
                  <h2>موقعیت روی نقشه</h2>
                </div>

                <div 
                  onClick={() => setMapModalOpen(true)} 
                  style={{ 
                    cursor: "pointer",
                    position: "relative",
                  }}
                  className="map-container"
                >
                  <LocationNoSsr details={details} />
                </div>
              </Box>

              {/* Realstate Card - Desktop Only */}
              <Box sx={{ display: { xs: "none", md: "block" }, marginTop: "24px" }}>
                <Link 
                  href={`/realestates/${cleanRealstate.id}?slug=${cleanRealstate.slug}`}
                  passHref
                  legacyBehavior
                >
                  <WorkerRealstateCard realstate={cleanRealstate} />
                </Link>
              </Box>
            </Grid>

            <Grid item xs={12} md={7}>
              <div className={Styles["worker-single-details"]}>
                <WorkerDetails
                  isFavorite={isFavorite}
                  onFavoriteToggle={toggleFavorite}
                  details={details}
                  properties={properties}
                  realstate={cleanRealstate}
                />
              </div>

              {/* Map - Mobile Only */}
              <Box sx={{ display: { xs: "block", md: "none" }, marginTop: "24px" }}>
                <div className={Styles["title"]}>
                  <h2>موقعیت روی نقشه</h2>
                </div>

                <div 
                  onClick={() => setMapModalOpen(true)} 
                  style={{ 
                    cursor: "pointer",
                    position: "relative",
                  }}
                  className="map-container"
                >
                  <LocationNoSsr details={details} />
                </div>
              </Box>

              {/* Realstate Card - Mobile Only */}
              <Box sx={{ display: { xs: "block", md: "none" }, marginTop: "24px" }}>
                <Link 
                  href={`/realestates/${cleanRealstate.id}?slug=${cleanRealstate.slug}`}
                  passHref
                  legacyBehavior
                >
                  <WorkerRealstateCard realstate={cleanRealstate} />
                </Link>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Sticky Call Button - Mobile Only */}
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px 20px",
            backgroundColor: "#fff",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
            zIndex: 10001,
          }}
          className="sticky-call-button"
        >
          <a
            href={`tel:${cleanRealstate?.phone || details.cellphone}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 16px",
              background: "#b92a31",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "22px",
              cursor: "pointer",
              transition: "all 0.2s",
              width: "100%",
            }}
            aria-label={`تماس با ${cleanRealstate?.name || details.name}`}
          >
            تماس : {cleanRealstate?.phone || details.cellphone}
          </a>
        </Box>

        <Dialog
          open={mapModalOpen}
          onClose={() => setMapModalOpen(false)}
          maxWidth="lg"
          fullWidth
          sx={{ "& .MuiDialog-paper": { height: "90vh" } }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", padding: "8px", backgroundColor: "#f5f5f5", borderBottom: "1px solid #ddd" }}>
            <IconButton
              onClick={() => {
                if (typeof window !== 'undefined' && details.latitude && details.longitude) {
                  const mapsUrl = `https://maps.google.com/?q=${details.latitude},${details.longitude}`;
                  window.open(mapsUrl, "_blank");
                }
              }}
              title="مسیریابی"
              aria-label="مسیریابی در نقشه"
            >
              <DirectionsIcon />
            </IconButton>
            <IconButton 
              onClick={() => setMapModalOpen(false)}
              aria-label="بستن نقشه"
            >
              <CloseIcon />
            </IconButton>
          </div>
          <DialogContent sx={{ padding: 0, height: "calc(100% - 56px)" }}>
            <LocationNoSsr details={details} mapHeight="100%" />
          </DialogContent>
        </Dialog>

        <div className={Styles["title"]}>
          <h2>
            موارد دیگر {details.category_name} در {details.neighbourhood}, {details.city}
          </h2>
        </div>

        <div style={{ margin: "0 20px" }}>
          <Grid container spacing={1}>
            {renderRelatedWorkers()}
          </Grid>
        </div>
      </div>
    </>
  );
};

WorkerSingle.propTypes = {
  details: PropTypes.object.isRequired,
  images: PropTypes.array.isRequired,
  videos: PropTypes.array.isRequired,
  virtual_tours: PropTypes.array.isRequired,
  properties: PropTypes.array.isRequired,
  realstate: PropTypes.object.isRequired,
  relateds: PropTypes.array.isRequired,
};

// OPTIMIZATION: Improved getServerSideProps with caching and timeout
export async function getServerSideProps(context) {
  const { params, res } = context;
  const id = params.id;

  // Set cache headers
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  try {
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const res = await fetch(`https://api.ajur.app/api/posts/${id}`, {
      signal: controller.signal,
      headers: {
        'Accept-Encoding': 'gzip',
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // Use the same cleanText function
    const cleanText = (text) => {
      if (!text || typeof text !== 'string') return '';
      return text
        .replace(/&[a-z]+;/g, '')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const cleanDetails = {
      ...data.details,
      name: cleanText(data.details.name || ''),
      category_name: cleanText(data.details.category_name || ''),
      region: cleanText(data.details.region || ''),
      city: cleanText(data.details.city || ''),
      neighbourhood: cleanText(data.details.neighbourhood || ''),
      address: cleanText(data.details.address || ''),
      description: cleanText(data.details.description || ''),
    };

    const cleanRealstate = data.realstate ? {
      ...data.realstate,
      name: cleanText(data.realstate.name || ''),
    } : {};

    return {
      props: {
        details: cleanDetails,
        images: data.images || [],
        videos: data.videos || [],
        virtual_tours: data.virtual_tours || [],
        properties: data.properties || [],
        realstate: cleanRealstate,
        relateds: data.relateds || [],
      },
    };
  } catch (error) {
    console.error("Error fetching worker data:", error);
    
    // Return minimal props instead of 404 for better UX
    return {
      props: {
        details: { id, name: '', category_name: '' },
        images: [],
        videos: [],
        virtual_tours: [],
        properties: [],
        realstate: {},
        relateds: [],
      },
    };
  }
}

export default React.memo(WorkerSingle);