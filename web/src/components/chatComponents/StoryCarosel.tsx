import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/navigation";
import "swiper/css/pagination";

// import required modules
import {
  Keyboard,
  Scrollbar,
  Navigation,
  Pagination,
  Autoplay,
} from "swiper/modules";

export default function StoryCarosel({ story }: any) {
  const [autoplayEnabled, setAutoplayEnabled] = useState(true); // State to manage autoplay
  const progressCircle = useRef<any>(null);
  const progressContent = useRef<any>(null);

  const onAutoplayTimeLeft = (s: any, time: any, progress: any) => {
    if (progressCircle.current) {
      progressCircle.current?.style.setProperty("--progress", 1 - progress);
      progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
    }
  };

  // Function to toggle autoplay
  const toggleAutoplay = () => {
    setAutoplayEnabled((prev) => !prev);
  };

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.swiper.autoplay.stop();
      if (autoplayEnabled) {
        swiperRef.current.swiper.autoplay.start();
      }
    }
  }, [autoplayEnabled]);

  const swiperRef = useRef<any>(null);

  return (
    <div
      className="h-[100%] w-[100%]"
      onMouseEnter={toggleAutoplay}
      onMouseLeave={toggleAutoplay}
    >
      <Swiper
        ref={swiperRef}
        slidesPerView={1}
        centeredSlides={false}
        slidesPerGroupSkip={1}
        grabCursor={true}
        onAutoplayTimeLeft={onAutoplayTimeLeft}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false, // Ensure autoplay continues even after user interaction
        }}
        keyboard={{
          enabled: true,
        }}
        breakpoints={{
          769: {
            slidesPerView: 1,
            slidesPerGroup: 1,
          },
        }}
        scrollbar={true}
        navigation={true}
        pagination={false}
        modules={[Keyboard, Scrollbar, Navigation, Pagination, Autoplay]}
        className="mySwiper"
      >
        {story?.map((elem: any, index: number) => {
          return (
            <SwiperSlide key={index}>
              <div className="h-[100%] w-[100%] flex justify-center items-center p-1 bg-[#020817]">
                <img style={{ objectFit: "contain" }} src={elem.url} />
              </div>
            </SwiperSlide>
          );
        })}

        {story && story?.length > 1 && (
          <div className="autoplay-progress" slot="container-end">
            <svg viewBox="0 0 48 48" ref={progressCircle}>
              <circle cx="24" cy="24" r="20"></circle>
            </svg>
            <span ref={progressContent}></span>
          </div>
        )}
      </Swiper>
    </div>
  );
}
