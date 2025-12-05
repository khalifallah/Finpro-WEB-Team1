import React, { useState, useEffect } from "react";
import Link from "next/link";

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  type: "promotion" | "info" | "banner";
}

interface HeroSectionProps {
  carousel: CarouselItem[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ carousel }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    if (carousel.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carousel.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carousel.length]);

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "promotion":
        return "badge-error";
      case "info":
        return "badge-info";
      case "banner":
        return "badge-success";
      default:
        return "badge-primary";
    }
  };

  if (!carousel || carousel.length === 0) {
    return (
      <div className="hero min-h-[400px] bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Welcome to Beyond Market</h1>
            <p className="py-6">
              Your one-stop shop for all grocery needs
            </p>
            <Link href="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Carousel */}
      <div className="carousel w-full h-[400px] md:h-[500px]">
        {carousel.map((item, index) => (
          <div
            key={item.id}
            id={`slide${index}`}
            className={`carousel-item relative w-full ${
              index === currentSlide ? "block" : "hidden"
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl">
                    <div className={`badge ${getBadgeColor(item.type)} mb-4`}>
                      {item.type.toUpperCase()}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      {item.title}
                    </h1>
                    <p className="text-lg md:text-xl text-white mb-6">
                      {item.description}
                    </p>
                    <Link
                      href={item.link}
                      className="btn btn-primary btn-lg"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
              <button
                className="btn btn-circle"
                onClick={() =>
                  setCurrentSlide(
                    (prev) => (prev - 1 + carousel.length) % carousel.length
                  )
                }
              >
                ❮
              </button>
              <button
                className="btn btn-circle"
                onClick={() =>
                  setCurrentSlide((prev) => (prev + 1) % carousel.length)
                }
              >
                ❯
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center w-full py-2 gap-2 absolute bottom-4">
        {carousel.map((_, index) => (
          <button
            key={index}
            className={`btn btn-xs ${index === currentSlide ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setCurrentSlide(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;