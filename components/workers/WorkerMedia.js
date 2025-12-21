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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [thumbnailSwiperInstance, setThumbnailSwiperInstance] = useState(null);
  const [mainImageSwiperInstance, setMainImageSwiperInstance] = useState(null);

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
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          closeLightbox();
        }
      }
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, showPrev, showNext, isFullscreen]);

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
      onSwiper={(swiper) => {
        if (type === "images") {
          setMainImageSwiperInstance(swiper);
        }
      }}
      onSlideChange={(swiper) => {
        if (type === "images") {
          setMainImageIndex(swiper.activeIndex);
          // Scroll thumbnail into view when main image changes
          if (thumbnailSwiperInstance) {
            thumbnailSwiperInstance.slideTo(swiper.activeIndex);
          }
        }
      }}
      className={Styles.swiperContainer}
    >
      {mediaList.map((item, index) => (
        <SwiperSlide key={index}>
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
        {activeTab === "images" && images.length > 0 && (
          <div className={Styles.mainImageWrapper}>
            {renderSlider(images, "images")}
            {/* Pagination Indicators */}
            {images.length > 1 && (
              <div className={Styles.paginationIndicators}>
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`${Styles.indicator} ${
                      mainImageIndex === index ? Styles.active : ""
                    }`}
                    onClick={() => setMainImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "virtual_tours" && virtual_tours.length > 0 && renderSlider(virtual_tours, "virtual_tours")}
        {activeTab === "videos" && videos.length > 0 && renderSlider(videos, "videos")}
      </div>

      {/* Thumbnail Carousel Below Main Image - Only show if ONLY images exist */}

      <div className={Styles.mediaBoxRow}>
        {images.length > 0 && (
          <div
            className={Styles.mediaBox}
            style={{ cursor: "pointer" }}
            onClick={() => {
              // Switch to the images tab and show the first image instead of opening the grid modal
              setActiveTab("images");
              setMainImageIndex(0);
              if (mainImageSwiperInstance && typeof mainImageSwiperInstance.slideTo === "function") {
                try {
                  mainImageSwiperInstance.slideTo(0);
                } catch (err) {
                  // Some swiper versions may require instance readiness; ignore failures
                  console.warn("Swiper slideTo failed:", err);
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setActiveTab("images");
                setMainImageIndex(0);
                if (mainImageSwiperInstance && typeof mainImageSwiperInstance.slideTo === "function") {
                  try {
                    mainImageSwiperInstance.slideTo(0);
                  } catch (err) {
                    console.warn("Swiper slideTo failed:", err);
                  }
                }
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className={Styles.thumbnailContainer}>
              <img
                src={images[0]?.url}
                alt="Preview"
                className={Styles.thumbnail}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div className={Styles.mediaCounter}>{images.length} عکس</div>
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
                <div className={Styles.mediaCounter}>بازدید مجازی</div>
              </div>
            </Link>
          </div>
        )}

        {videos.length > 0 && (
          <div className={Styles.mediaBox} onClick={() => setActiveTab("videos")}>
            <div className={Styles.thumbnailContainer}>
              <img src={images[1]?.url || images[0]?.url} alt="Preview" className={Styles.thumbnail} />
              <div className={Styles.mediaCounterVideo}>
                <PlayArrowIcon className={Styles.playIcon} />
              </div>
            </div>
          </div>
        )}

        {/* Empty slots to maintain 1/3 grid */}
        {images.length === 0 && (
          <div className={Styles.mediaBox} style={{ visibility: "hidden" }} />
        )}
        {virtual_tours.length === 0 && (
          <div className={Styles.mediaBox} style={{ visibility: "hidden" }} />
        )}
        {videos.length === 0 && (
          <div className={Styles.mediaBox} style={{ visibility: "hidden" }} />
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
            background: isFullscreen ? "#000" : "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: isFullscreen ? "center" : "flex-start",
            padding: isFullscreen ? 0 : "20px",
            overflow: isFullscreen ? "hidden" : "auto",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              if (isFullscreen) {
                setIsFullscreen(false);
              } else {
                closeLightbox();
              }
            }
          }}
        >
          {isFullscreen ? (
            <>
              {/* Fullscreen View */}
              <button
                aria-label="Exit fullscreen"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(false);
                }}
                style={{
                  position: "fixed",
                  top: 20,
                  right: 20,
                  zIndex: 4002,
                  background: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 44,
                  height: 44,
                  cursor: "pointer",
                  fontSize: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                }}
              >
                ×
              </button>

              {/* Fullscreen Image */}
              <img
                src={images[lightboxIndex]?.url}
                alt={`Fullscreen ${lightboxIndex}`}
                style={{
                  maxWidth: "95vw",
                  maxHeight: "95vh",
                  objectFit: "contain",
                }}
              />

              {/* Left Arrow */}
              {images.length > 1 && (
                <button
                  aria-label="Previous"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPrev();
                  }}
                  style={{
                    position: "fixed",
                    left: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 4002,
                    background: "rgba(255,255,255,0.9)",
                    border: "none",
                    borderRadius: 4,
                    width: 50,
                    height: 50,
                    cursor: "pointer",
                    fontSize: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "rgba(255,255,255,1)";
                    e.target.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.9)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  ‹
                </button>
              )}

              {/* Right Arrow */}
              {images.length > 1 && (
                <button
                  aria-label="Next"
                  onClick={(e) => {
                    e.stopPropagation();
                    showNext();
                  }}
                  style={{
                    position: "fixed",
                    right: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 4002,
                    background: "rgba(255,255,255,0.9)",
                    border: "none",
                    borderRadius: 4,
                    width: 50,
                    height: 50,
                    cursor: "pointer",
                    fontSize: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "rgba(255,255,255,1)";
                    e.target.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.9)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  ›
                </button>
              )}

              {/* Bottom Counter */}
              {(videos.length > 0 || virtual_tours.length > 0) && (
                <div
                  style={{
                    position: "fixed",
                    bottom: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 4002,
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    padding: "10px 20px",
                    borderRadius: 4,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {lightboxIndex + 1} / {images.length}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Grid View */}
              {/* Close button */}
              <button
                aria-label="Close"
                onClick={closeLightbox}
                style={{
                  position: "fixed",
                  top: 20,
                  right: 20,
                  zIndex: 4001,
                  background: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 44,
                  height: 44,
                  cursor: "pointer",
                  fontSize: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "scale(1.1)";
                  e.target.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "0 2px 12px rgba(0,0,0,0.15)";
                }}
              >
                ×
              </button>



              {/* Grid View of all images - responsive large pictures */}
              <div className={Styles.gridGallery} onClick={(e) => e.stopPropagation()}>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={0}
                    className={Styles.gridItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(idx);
                      setIsFullscreen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setLightboxIndex(idx);
                        setIsFullscreen(true);
                      }
                    }}
                  >
                    <img src={img.url} alt={`Image ${idx}`} className={Styles.gridImage} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}