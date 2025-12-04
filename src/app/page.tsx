"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/libs/axios/axios.config";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductList from "@/components/ProductList";
import Footer from "@/components/Footer";
import LocationPermissionModal from "@/components/LocationPermissionModal";

export default function Home() {
  const [homepageData, setHomepageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);

  // Function to get user's location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        fetchHomepageData(latitude, longitude);
        setShowLocationModal(false);
      },
      (err) => {
        console.error("Error getting location:", err);
        // Fallback to default store
        fetchHomepageData();
        setShowLocationModal(false);
      }
    );
  };

  // Function to fetch homepage data
  const fetchHomepageData = async (lat?: number, lng?: number) => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 12 };
      
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
      }

      const res = await axiosInstance.get("/homepage", { params });
      setHomepageData(res.data.data);
      setSelectedStore(res.data.data.productList.store);
    } catch (err: any) {
      console.error("Error fetching homepage data:", err);
      setError(err.message || "Failed to load homepage data");
    } finally {
      setLoading(false);
    }
  };

  // Check for location permission on component mount
  useEffect(() => {
    // Check if we have previously stored location
    const storedLocation = localStorage.getItem("userLocation");
    
    if (storedLocation) {
      const location = JSON.parse(storedLocation);
      setUserLocation(location);
      fetchHomepageData(location.latitude, location.longitude);
    } else {
      // Show modal to request location permission
      setTimeout(() => {
        setShowLocationModal(true);
      }, 1000);
      
      // If user doesn't give permission, fetch with default store
      fetchHomepageData();
    }
  }, []);

  // Handle location permission acceptance
  const handleAcceptLocation = () => {
    getUserLocation();
  };

  // Handle location permission denial
  const handleDenyLocation = () => {
    setShowLocationModal(false);
    fetchHomepageData(); // Fetch with default store
  };

  // Handle store change (if user wants to manually select a store)
  const handleStoreChange = (storeId: number) => {
    // In a real implementation, you would update the store and refetch products
    console.log("Store changed to:", storeId);
  };

  if (loading && !homepageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error && !homepageData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="alert alert-error max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error: {error}</span>
        </div>
        <button 
          className="btn btn-primary mt-4"
          onClick={() => fetchHomepageData()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Location Permission Modal */}
      <LocationPermissionModal
        isOpen={showLocationModal}
        onAccept={handleAcceptLocation}
        onDeny={handleDenyLocation}
      />

      {/* Navigation Bar */}
      <Navbar
        categories={homepageData?.navigation.categories || []}
        featuredLinks={homepageData?.navigation.featuredLinks || []}
        selectedStore={selectedStore}
        onStoreChange={handleStoreChange}
      />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection carousel={homepageData?.heroSection.carousel || []} />

        {/* Store Information */}
        {selectedStore && (
          <div className="container mx-auto px-4 py-6">
            <div className="alert alert-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div>
                <h3 className="font-bold">Shopping from: {selectedStore.name}</h3>
                <div className="text-xs">
                  {selectedStore.address}
                  {selectedStore.distance && (
                    <span> • {selectedStore.distance.toFixed(1)} km away</span>
                  )}
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setShowLocationModal(true)}
              >
                Change Location
              </button>
            </div>
          </div>
        )}

        {/* Product List */}
        <ProductList
          products={homepageData?.productList.products || []}
          pagination={homepageData?.productList.pagination}
          loading={loading}
        />
      </main>

      {/* Footer */}
      <Footer footerData={homepageData?.footer} />
    </div>
  );
}