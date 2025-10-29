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

const SingleCategory = (props) => {
  const router = useRouter();
  const { slug, id, categories, subcat, neighbor } = router.query;
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, set_loading] = useState(true);
  const [name, set_name] = useState(false);
  const [city, set_city] = useState(false);
  const [neighborhoods, set_neighborhoods] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [workers, set_workers] = useState([]);
  const [details, set_details] = useState([]);
  const [all_workers, set_all_workers] = useState([]);
  const [cats, set_cats] = useState([]);
  const [main_cats, set_main_cats] = useState(null);
  const [y_scroll, set_y_scroll] = useState(0);

  const [showAllNeighborhoods, setShowAllNeighborhoods] = useState(false);

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
        name: newCategory.name,
        id: newCategory.id,
      };

      // Redirect to the new category page with all parameters
      router.push({
        pathname: `/${city}/${newCategory.name}`,
        query: query,
      });
    } else {
      // If category is cleared, redirect to main categories page
      router.push(`/${city}`);
    }
  };

  /* fetch single worker data and Images */
  useEffect(() => {
    if (props.workers) {
      set_loading(false);
    }

    set_workers(props.workers);
    set_all_workers(props.workers);
    setFilteredWorkers(props.workers);
    set_details(props.details);
    set_cats(props.subcategories);
    set_main_cats(props.main_cats);
    set_neighborhoods(props.neighborhoods);
    set_name(props.name);
    set_city(props.city);

    // Set the selected category from details
    if (props.details && props.details.id) {
      setSelectedCat({
        id: props.details.id,
        name: props.details.name,
      });
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
    if (filteredWorkers.length > 0) {
      return (
        <LazyLoader
          items={filteredWorkers}
          itemsPerPage={8}
          delay={800}
          renderItem={(worker) => (
            <Link
              href={`/worker/${worker.id}?slug=${worker.slug}`}
              key={worker.id}
            >
              <Grid item md={4} xs={12} key={worker.id}>
                <a onClick={AlterLoading}>
                  <WorkerCard worker={worker} />
                </a>
              </Grid>
            </Link>
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
                initialCategory={selectedCat}
                onCategoryChange={handleCategoryChange}
              />
            </Grid>
          </Grid>
        </Box>
      </div>
    );
  };

  const renderOrSpinner = () => {
    if (!loading) {
      return (
        <div>
          <div className={Styles["realstate-items-wrapper"]}>
            <div className={Styles["main-wrapper"]}>
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

  return (
    <div className="realstate-contents-wrapper">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="robots" content="max-image-preview:large" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <title>
          آجر : {details.name} {city}
        </title>
        <meta name="description" content={"آجر :" + details.name + city} />
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
        <meta property="og:locale" content="fa_IR" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={"آجر :" + details.name + city} />
        <meta
          property="og:description"
          content={"آجر :" + details.name + city}
        />
        <meta
          property="og:url"
          content={
            "https://ajur.app/realestates/" +
            details.id +
            "?slug=" +
            details.slug
          }
        />
        <meta property="og:site_name" content="مشاور املاک هوشمند آجر" />
        <meta
          property="article:published_time"
          content="2024-05-19T21:34:43+00:00"
        />
        <meta
          property="article:modified_time"
          content="2024-01-28T03:47:57+00:00"
        />
        <meta
          property="og:image"
          content={"ajur.app/cats_image/" + details.avatar + ".jpg"}
        />
        <meta property="og:image:width" content="600" />
        <meta property="og:image:height" content="1067" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:label1" content="Written by" />
        <meta name="twitter:data1" content={"آجر :" + details.name + city} />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="canonical"
          href={"https://ajur.app/" + city + "/" + details.name}
        />
      </Head>
      {renderOrSpinner()}
    </div>
  );
};

export async function getServerSideProps(context) {
  const { params } = context;

  const name = params.name;
  const categories_city = params.categories;
  const city = categories_city ? categories_city : "رباط کریم";
  const subcat = context.query.subcat ? context.query.subcat : null;
  const neighbor = context.query.neighbor ? context.query.neighbor : null;

  const res = await fetch(
    `https://api.ajur.app/api/main-category-workers?subcat=${subcat}&catname=${name}&city=${city}`
  );
  const data = await res.json();

  return {
    props: {
      details: data.details,
      workers: data.workers,
      all_workers: data.workers,
      specials: data.specials,
      uppers: data.uppers,
      subcategories: data.subcategories,
      main_cats: data.main_cats,
      name: name,
      city: city,
      neighborhoods: data.the_neighborhoods,
      neighbor: neighbor,
      subcat: subcat,
    },
  };
}

export default SingleCategory;
