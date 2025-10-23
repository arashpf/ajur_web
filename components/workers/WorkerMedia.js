import React, { useState, useEffect, useCallback } from "react";
import Styles from "../styles/WorkerMedia.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Link from "next/link";

export default function WorkerMedia({ images = [], virtual_tours = [], videos = [] }) {
  const [activeTab, setActiveTab] = useState("images");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    // prevent background scroll
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };

  const showPrev = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, showPrev, showNext]);

  const renderSlider = (mediaList, type) => {
  return (
    <Swiper
      spaceBetween={10}
      slidesPerView={1}
      pagination={{ 
        clickable: true,
        renderBullet: (index, className) => {
          return `<span class="${className}">${index + 1}</span>`;
        }
      }}
      className={Styles.swiperContainer}
    >
      {mediaList.map((item, index) => (
        <SwiperSlide key={index}>
          <div className={Styles.slideCounter}>
            {index + 1}/{mediaList.length}
          </div>
          {type === "images" && (
            <img
              src={item.url}
              alt={`Image ${index}`}
              className={Styles.mainImage}
              onClick={() => openLightbox(index)}
              style={{ cursor: "pointer" }}
            />
          )}
          {type === "virtual_tours" && (
            <iframe
              src={item.url}
              title={`Virtual Tour ${index}`}
              className={Styles.iframe}
              allowFullScreen
            />
          )}
          {type === "videos" && (
            <video controls className={Styles.video}>
              <source src={item.absolute_path} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

const onClickImageThumbs = () => {
  if(1){
    setActiveTab("images");
  }
}

  return (
    <div className={Styles.wrapper}>
      <div className={Styles.mediaContainer}>
        {activeTab === "images" && images.length > 0 && renderSlider(images, "images")}
        {activeTab === "virtual_tours" && virtual_tours.length > 0 && renderSlider(virtual_tours, "virtual_tours")}
        {activeTab === "videos" && videos.length > 0 && renderSlider(videos, "videos")}
      </div>

      <div className={Styles.mediaBoxRow}>
        {images.length > 0 && (
          <div className={Styles.mediaBox} onClick={onClickImageThumbs}>
            <div className={Styles.thumbnailContainer}>
              <img src={images[0]?.url} alt="Preview" className={Styles.thumbnail} />
              <div className={Styles.mediaCounter}> {images.length} {'عکس'} </div>
            </div>
           
          </div>
        )}

        {virtual_tours.length > 0 && (
           
          <div className={Styles.mediaBox} onClick={() => setActiveTab("virtual_tours")}>
            <Link
  href={`/virtual-tour/${virtual_tours[0].worker_id}/`}
  as={`/virtual-tour/${virtual_tours[0].worker_id}/`}
>
            <div className={Styles.thumbnailContainer}>
              <img src={virtual_tours[0]?.thumbnail_url} alt="Preview" className={Styles.thumbnail} />
              <div className={Styles.mediaCounter}> بازدید مجازی</div>
            </div>

            </Link>
           
          </div>
        )}

        {videos.length > 0 && (
          <div className={Styles.mediaBox} onClick={() => setActiveTab("videos")}>
            <div className={Styles.thumbnailContainer}>
               <img src={ images[1]?.url || images[0]?.url} alt="Preview" className={Styles.thumbnail} />
              <div className={Styles.mediaCounterVideo}>
                 <PlayArrowIcon className={Styles.playIcon} />
              </div>
            </div>
            
          </div>
        )}
      </div>
      {/* Lightbox overlay */}
      {lightboxOpen && images && images.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            zIndex: 4000,
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={closeLightbox}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "95%",
              maxHeight: "95%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex].url}
              alt={`Large ${lightboxIndex}`}
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "80vh",
                margin: "0 auto",
              }}
            />

            {/* Controls */}
            <button
              aria-label="Close"
              onClick={closeLightbox}
              style={{
                position: "absolute",
                right: -10,
                top: -10,
                background: "#fff",
                border: "none",
                borderRadius: 20,
                width: 36,
                height: 36,
                cursor: "pointer",
              }}
            >
              ×
            </button>

            {images.length > 1 && (
              <>
                <button
                  aria-label="Previous"
                  onClick={showPrev}
                  style={{
                    position: "absolute",
                    left: -50,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.9)",
                    border: "none",
                    borderRadius: 4,
                    padding: "8px 10px",
                    cursor: "pointer",
                  }}
                >
                  ‹
                </button>

                <button
                  aria-label="Next"
                  onClick={showNext}
                  style={{
                    position: "absolute",
                    right: -50,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.9)",
                    border: "none",
                    borderRadius: 4,
                    padding: "8px 10px",
                    cursor: "pointer",
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}