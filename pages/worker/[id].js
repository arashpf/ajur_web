import React, { useState, useEffect } from "react";
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

// Components
import WorkerMedia from "../../components/workers/WorkerMedia";
import WorkerCard from "../../components/cards/WorkerCard";
import WorkerDetails from "../../components/workers/WorkerDetails";
import WorkerRealstateCard from "../../components/cards/realestate/WorkerRealstateCard";
import WorkerShare from "../../components/workers/WorkerShare";
import LazyLoader from "../../components/lazyLoader/Loading";
import Breadcrumb from "../../components/common/Breadcrumb";

// Dynamic imports
const LocationNoSsr = dynamic(() => import("../../components/map/Location"), {
  ssr: false,
});

// Styles
import Styles from "../../components/styles/WorkerSingle.module.css";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const WorkerSingle = (props) => {
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const router = useRouter();
  const { slug, id } = router.query;

  const {
    details,
    properties,
    realstate,
    relateds,
    images,
    videos,
    virtual_tours,
  } = props;

  useEffect(() => {
    // Check if this worker is favorited
    const favorited = Cookies.get("favorited");
    if (favorited) {
      const favoriteItems = JSON.parse(favorited);
      setIsFavorite(favoriteItems.includes(details.id));
    }

    // Add to browsing history
    let history = Cookies.get("history") || "[]";
    let historyItems = JSON.parse(history);

    // Remove if already exists and add to end
    historyItems = historyItems.filter((item) => item !== details.id);
    historyItems.push(details.id);

    // Keep only last 10 items
    if (historyItems.length > 10) {
      historyItems = historyItems.slice(-10);
    }

    Cookies.set("history", JSON.stringify(historyItems));

    // Set loading to false when data is ready
    if (details) {
      setLoading(false);
    }
  }, [details, id]);

  const toggleFavorite = () => {
    let favorited = Cookies.get("favorited") || "[]";
    let favoriteItems = JSON.parse(favorited);

    if (isFavorite) {
      // Remove from favorites
      favoriteItems = favoriteItems.filter((item) => item !== details.id);
      Cookies.set("favorited", JSON.stringify(favoriteItems));
    } else {
      // Add to favorites
      if (!favoriteItems.includes(details.id)) {
        favoriteItems.push(details.id);
        // Keep only last 20 items
        if (favoriteItems.length > 20) {
          favoriteItems = favoriteItems.slice(-20);
        }
        Cookies.set("favorited", JSON.stringify(favoriteItems));
      }
    }

    setIsFavorite(!isFavorite);
  };

  const renderSeoHeader = () => {
    // Generate comprehensive meta description
    const metaDescription = details.description
      ? details.description.substring(0, 160)
      : `${details.name} - ${details.category_name} در ${details.region}, ${details.city}. مشاور منتخب برای مشاوره و راهنمایی در ${details.category_name}`;

    // Generate keywords
    const keywords = `${details.name}, ${details.category_name}, ${details.city}, ${details.region}, ${details.neighbourhood}, مشاور, مشاوره, ${realstate?.name || ''}`.trim();

    // Structured data for Person/Professional
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
      department: realstate?.name || "",
      geo: {
        "@type": "GeoCoordinates",
        latitude: details.latitude || 0,
        longitude: details.longitude || 0,
      },
      sameAs: details.website ? [details.website] : [],
    };

    return (
      <Head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        
        {/* Primary Meta Tags */}
        <title>
          {details.name} - {details.category_name} در {details.region}, {details.city} | آجر
        </title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={realstate?.name || "آجر"} />
        
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
        <meta property="og:type" content="business.business" />
        <meta property="og:site_name" content="آجر - مشاور هوشمند" />
        <meta
          property="og:title"
          content={`${details.name} - ${details.category_name} در ${details.city}`}
        />
        <meta property="og:description" content={metaDescription} />
        <meta
          property="og:url"
          content={`https://ajur.app/worker/${details.id}`}
        />
        <meta property="og:image" content={details.thumb} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        
        {/* Article Meta Tags */}
        {details.created_at && (
          <meta property="article:published_time" content={details.created_at} />
        )}
        {details.updated_at && (
          <meta property="article:modified_time" content={details.updated_at} />
        )}
        <meta property="article:author" content={realstate?.name || "آجر"} />
        <meta property="article:section" content={details.category_name} />
        <meta property="article:tag" content={details.city} />
        <meta property="article:tag" content={details.region} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${details.name} - ${details.category_name}`}
        />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={details.thumb} />
        
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
      </Head>
    );
  };

  const goToRelatedWorker = (worker) => {
    window.location.href = `/worker/${worker.id}?slug=${worker.slug}`;
  };

  const renderRelatedWorkers = () => {
    if (!Array.isArray(relateds) || relateds.length === 0) {
      return <p>هیچ مورد مشابهی یافت نشد</p>;
    }

    return (
      <LazyLoader
        items={relateds} // ✅ the whole array
        itemsPerPage={8}
        delay={800}
        renderItem={(worker) => (
         
          // <Link
          //   href={`/worker/${worker.id}?slug=${worker.slug}`}
          //   key={worker.id}
          // >
          //   <Grid item md={4} xs={12} key={worker.id}>
          //   <WorkerCard worker={worker} />
          //   </Grid>
          // </Link>

          <Grid item md={4} xs={12} key={worker.id}>
          <a
             href={`/worker/${worker.id}?slug=${worker.slug}`}
             key={worker.id}
          >
            {/* <WorkerCard worker={worker} /> */}
            <WorkerCard worker={worker} />
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
        gridProps={{ spacing: 2 }}
        itemProps={{ xl: 3, md: 4, xs: 12 }}
      />
    );
  };

  return (
    <>
      {renderSeoHeader()}

      <style>{`
        .worker-single-page .swiper {
          padding: 0 !important;
        }
      `}</style>

      <div className={`${Styles["scroll-div"]} ${Styles["worker-single"]} worker-single-page`} style={{ margin: "0 20px" }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              label: details.category_name,
              href: `/${details.city}/${details.category_name}?city=${details.city}&subcat=${details.category_name}`,
            },
            {
              label: details.name,
              href: "",
            },
          ]}
        />

        <Box sx={{ flexGrow: 1 }}>
          {/* Main Heading for SEO */}
          <div style={{ display: "none" }}>
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
                <div className={Styles["favorite-icon"]} onClick={toggleFavorite}>
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
                    pointerEvents: "auto"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: "auto",
                      zIndex: 10,
                    }}
                  />
                  <div style={{ pointerEvents: "none" }}>
                    <LocationNoSsr details={details} />
                  </div>
                </div>
              </Box>

              {/* Realstate Card - Desktop Only */}
              <Box sx={{ display: { xs: "none", md: "block" }, marginTop: "24px" }}>
                <Link href={`/realestates/${realstate.id}?slug=${realstate.slug}`}>
                  <WorkerRealstateCard realstate={realstate} />
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
                  realstate={realstate}
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
                    pointerEvents: "auto"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: "auto",
                      zIndex: 10,
                    }}
                  />
                  <div style={{ pointerEvents: "none" }}>
                    <LocationNoSsr details={details} />
                  </div>
                </div>
              </Box>

              {/* Realstate Card - Mobile Only */}
              <Box sx={{ display: { xs: "block", md: "none" }, marginTop: "24px" }}>
                <Link href={`/realestates/${realstate.id}?slug=${realstate.slug}`}>
                  <WorkerRealstateCard realstate={realstate} />
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
            padding: "16px 20px 16px",
            backgroundColor: "#fff",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
            zIndex: 10001,
          }}
        >
          <a
            href={`tel:${realstate?.phone || details.cellphone}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 16px",
              background: "#0066cc",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.2s",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#0052a3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0066cc";
            }}
          >
            تماس: {realstate?.phone || details.cellphone}
          </a>
        </Box>

        <Dialog
          open={mapModalOpen}
          onClose={() => setMapModalOpen(false)}
          maxWidth="lg"
          fullWidth
          sx={{ "& .MuiDialog-paper": { height: "90vh" } }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", p: "8px", backgroundColor: "#f5f5f5", borderBottom: "1px solid #ddd" }}>
            <IconButton
              onClick={() => {
                const lat = details.lat;
                const long = details.long;
                const mapsUrl = `https://maps.google.com/?q=${lat},${long}`;
                window.open(mapsUrl, "_blank");
              }}
              title="مسیریابی"
            >
              <DirectionsIcon />
            </IconButton>
            <IconButton onClick={() => setMapModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <DialogContent sx={{ p: 0, height: "calc(100% - 56px)" }}>
            <LocationNoSsr details={details} mapHeight="100%" />
          </DialogContent>
        </Dialog>

        {/* <WorkerShare details={details} slug={slug} /> */}

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

export async function getServerSideProps(context) {
  const { params } = context;
  const id = params.id;

  try {
    const res = await fetch(`https://api.ajur.app/api/posts/${id}`);
    const data = await res.json();

    return {
      props: {
        details: data.details,
        images: data.images || [],
        videos: data.videos || [],
        virtual_tours: data.virtual_tours || [],
        properties: data.properties || [],
        realstate: data.realstate || {},
        relateds: data.relateds || [],
      },
    };
  } catch (error) {
    console.error("Error fetching worker data:", error);
    return {
      notFound: true,
    };
  }
}

export default WorkerSingle;
