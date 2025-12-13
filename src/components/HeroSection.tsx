"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Tag,
  Info,
} from "lucide-react";

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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate carousel
  useEffect(() => {
    if (!isAutoPlaying || carousel.length <= 1) return;

    const interval = setInterval(() => {
      goToNextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, isAutoPlaying, carousel.length]);

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carousel.length - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === carousel.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case "promotion":
        return <Tag className="w-3 h-3" />;
      case "info":
        return <Info className="w-3 h-3" />;
      default:
        return <ShoppingBag className="w-3 h-3" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "promotion":
        return "bg-gradient-to-r from-orange-500 to-red-500";
      case "info":
        return "bg-gradient-to-r from-blue-500 to-cyan-500";
      case "banner":
        return "bg-gradient-to-r from-green-500 to-emerald-500";
      default:
        return "bg-gradient-to-r from-purple-500 to-pink-500";
    }
  };

  if (!carousel || carousel.length === 0) {
    return (
      <div className="hero min-h-[400px] bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl shadow-lg mx-4 my-6">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-4">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Welcome to <span className="text-emerald-600">Beyond Market</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Fresh groceries delivered to your doorstep
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 btn btn-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl mx-4 my-6">
      {/* Pause/Play Button */}
      <button
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label={isAutoPlaying ? "Pause auto-play" : "Play auto-play"}
      >
        {isAutoPlaying ? (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-4 bg-gray-600 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-4 bg-gray-600 rounded-full animate-pulse"></div>
          </div>
        ) : (
          <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
        )}
      </button>

      {/* Carousel Container */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-2xl">
        {carousel.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? "opacity-100 translate-x-0"
                : index < currentSlide
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
            }`}
            style={{ zIndex: index === currentSlide ? 10 : 0 }}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/1200x600/3B82F6/FFFFFF?text=${encodeURIComponent(
                    item.title
                  )}`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-6 md:px-8">
                <div className="max-w-xl lg:max-w-2xl">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-lg backdrop-blur-sm bg-white/10 border border-white/20">
                    <div
                      className={`p-1.5 rounded-full ${getBadgeColor(
                        item.type
                      )}`}
                    >
                      {getBadgeIcon(item.type)}
                    </div>
                    <span className="text-white font-medium text-sm uppercase tracking-wider">
                      {item.type}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    {item.title}
                  </h1>

                  {/* Description */}
                  <p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg leading-relaxed">
                    {item.description}
                  </p>

                  {/* CTA Button */}
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-2 btn btn-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={goToNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Slide Indicators with Numbers */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="text-white text-sm font-medium">
            {currentSlide + 1}
          </span>
          <span className="text-white/60 text-sm">/</span>
          <span className="text-white/60 text-sm">{carousel.length}</span>
        </div>

        <div className="flex items-center gap-2">
          {carousel.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 h-2 bg-white rounded-full"
                  : "w-2 h-2 bg-white/40 rounded-full hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Slide Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300"
          style={{
            width: `${((currentSlide + 1) / carousel.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export default HeroSection;
