"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/libs/axios/axios.config";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductList from "@/components/ProductList";
import Pagination from "@/components/common/Pagination";
import Footer from "@/components/Footer";
import LocationPermissionModal from "@/components/LocationPermissionModal";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function Home() {
  const { showToast } = useToast(); // Add this
  const { user } = useAuth(); // Add this
  const { refreshCart } = useCart();
  const [homepageData, setHomepageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    console.log("🔄 Homepage data updated:", homepageData);
    console.log("🔄 Products:", homepageData?.productList?.products);

    if (homepageData?.productList?.products?.length > 0) {
      console.log(
        "🔄 First product details:",
        homepageData.productList.products[0]
      );
      console.log(
        "🔄 First product images:",
        homepageData.productList.products[0]?.images
      );
      console.log(
        "🔄 First product productImages:",
        homepageData.productList.products[0]?.productImages
      );
    }
  }, [homepageData]);

  useEffect(() => {
    fetchHomepageData(undefined, undefined, undefined, 1, pageSize);
  }, []);

  useEffect(() => {
    console.log("FULL HOMEPAGE DATA:", homepageData);
    // Jika data homepage sudah termuat DAN ada info toko terdekat
    if (homepageData?.nearestStore) {
      console.log("KETEMU TOKO:", homepageData.nearestStore); // <--- Cek ini muncul gak?
      // 1. Set state toko yang dipilih di halaman ini
      setSelectedStore(homepageData.nearestStore);

      // 2. Simpan ID Toko ke LocalStorage agar CartContext bisa membacanya
      localStorage.setItem("storeId", String(homepageData.nearestStore.id));

      console.log(
        "Auto-selected Store ID saved:",
        homepageData.nearestStore.id
      );
    } else {
      console.log("DATA TOKO TIDAK DITEMUKAN DI RESPONSE");
    }
  }, [homepageData]);

  const handleManualStoreSelect = async (store: any) => {
    console.log("User manually selected store:", store);

    // 1. Update State UI agar tampilan berubah (Nama toko di atas produk)
    setSelectedStore(store);

    // 2. Simpan ID ke LocalStorage (Wajib, agar CartContext & AddToCart bisa baca)
    localStorage.setItem("storeId", String(store.id));

    // 3. Refresh keranjang (siapa tahu user punya barang di toko ini sebelumnya)
    await refreshCart();
    setCurrentPage(1);
    fetchHomepageData(undefined, undefined, store.id, 1, pageSize);

    // 4. Tutup Modal
    setShowLocationModal(false);

    // 5. (Opsional) Beri feedback ke user
    showToast(`Shopping at ${store.name}`, "success");

    // 6. (Opsional) Refresh data produk jika API support filter by storeId
    // fetchHomepageData(undefined, undefined, store.id);
  };

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
  const fetchHomepageData = async (
    latitude?: number,
    longitude?: number,
    storeIdOverride?: number,
    page?: number,
    limit?: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching homepage data...");

      const params: any = { page: page || currentPage || 1, limit: limit || pageSize };

      if (storeIdOverride) {
        params.storeId = storeIdOverride;
      } else if (latitude && longitude) {
        params.lat = latitude;
        params.lng = longitude;
      }

      console.log("Request params:", params);

      // Add retry mechanism
      let retries = 3;
      let lastError: any;

      while (retries > 0) {
        try {
          const response = await axiosInstance.get("/homepage", {
            params,
            timeout: 60000, // Increased timeout
          });

          console.log("Full API Response:", response);

          if (
            response.data.status === 200 ||
            response.data.status === "success"
          ) {
            let homepageData = response.data.data;

            // Transform the products to match frontend expectations
            if (homepageData?.productList?.products) {
              homepageData.productList.products =
                homepageData.productList.products.map((product: any) => {
                  // Handle different image structures
                  let images: any[] = [];

                  if (product.images) {
                    // If images is array of strings
                    if (
                      Array.isArray(product.images) &&
                      product.images.length > 0
                    ) {
                      if (typeof product.images[0] === "string") {
                        images = product.images.map(
                          (url: string, index: number) => ({
                            id: index,
                            imageUrl: url,
                          })
                        );
                      } else if (product.images[0].imageUrl) {
                        // If already in correct format
                        images = product.images;
                      }
                    }
                  }

                  return {
                    ...product,
                    images: images,
                    // Also handle price field
                    price: product.price || product.defaultPrice || 0,
                  };
                });
            }

            // update current page if backend provided pagination
            const pagination = homepageData?.productList?.pagination;
            if (pagination && pagination.page) setCurrentPage(pagination.page);

            setHomepageData(homepageData);
            return; // success, exit the function
          } else {
            throw new Error(
              response.data.message || "Failed to load homepage data"
            );
          }
        } catch (err: any) {
          lastError = err;
          retries--;

          if (retries > 0) {
            console.log(`Retrying... ${retries} attempts left`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      }

      // If we get here, all retries failed
      throw lastError || new Error("All retry attempts failed");
    } catch (err: any) {
      console.error("Error fetching homepage data:", err);

      // Extract meaningful error message
      let errorMessage = "Failed to load homepage data";

      if (err?.message?.includes("timeout")) {
        errorMessage =
          "Request timeout. Backend server might be slow or unavailable.";
      } else if (
        err?.message?.includes("Network Error") ||
        err?.message?.includes("ECONNREFUSED")
      ) {
        errorMessage =
          "Cannot connect to backend server. Please make sure the backend is running on http://localhost:8000";
      } else if (err?.message?.includes("CORS")) {
        errorMessage = "CORS error. Please check backend CORS configuration.";
      } else {
        errorMessage = err?.message || "Failed to load homepage data";
      }

      setError(errorMessage);

      // Fallback data for development
      setHomepageData({
        navigation: {
          categories: [
            { id: 1, name: "Groceries", productCount: 10 },
            { id: 2, name: "Beverages", productCount: 8 },
            { id: 3, name: "Snacks", productCount: 15 },
          ],
          featuredLinks: [
            { name: "Home", url: "/", icon: "home" },
            { name: "Products", url: "/products", icon: "shopping-bag" },
            { name: "Categories", url: "/categories", icon: "grid" },
            { name: "Deals", url: "/deals", icon: "tag" },
          ],
        },
        heroSection: {
          carousel: [
            {
              id: 1,
              imageUrl:
                "https://placeholder.pics/svg/1200x400/DEDEDE/555555/Welcome%20to%20Beyond%20Market",
              title: "Welcome to Beyond Market",
              subtitle: "Your one-stop grocery shop",
              ctaText: "Shop Now",
              link: "/products", // Make sure this exists
              type: "banner", // Add type field
            },
          ],
        },
        productList: {
          products: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
        },
        footer: {
          copyright: "© 2024 Beyond Market. All rights reserved.",
          links: [
            { name: "About Us", url: "/about" },
            { name: "Contact", url: "/contact" },
            { name: "Privacy Policy", url: "/privacy" },
            { name: "Terms of Service", url: "/terms" },
          ],
        },
      });
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
  const handleStoreChange = async (storeId: number) => {
    // In a real implementation, you would update the store and refetch products
    console.log("Store changed to:", storeId);
    localStorage.setItem("storeId", String(storeId));
    await refreshCart();
    fetchHomepageData();
    const newStore = { id: storeId, name: "Store...", address: "..." };
    setSelectedStore(newStore);
  };

  // Page change handler: preserve selected store when requesting new page
  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    const sid = selectedStore?.id || (localStorage.getItem("storeId") ? Number(localStorage.getItem("storeId")) : undefined);
    fetchHomepageData(undefined, undefined, sid, p, pageSize);
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

  console.log(
    "Homepage data product images:",
    homepageData?.productList?.products?.map((p: any) => ({
      name: p.name,
      images: p.images, // Check the structure here
    }))
  );

  // Fix the add to cart function in ProductCard component
  const handleAddToCart = async (product: any, quantity: number = 1) => {
    if (!user) {
      // Store redirect path and show login prompt
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      window.location.href = "/login";
      return;
    }

    if (!user.emailVerifiedAt) {
      showToast(
        "Please verify your email before adding items to cart.",
        "warning"
      );
      return;
    }

    if (!selectedStore?.id) {
      showToast("Please select a store/location first.", "error");
      // Opsional: Buka modal lokasi otomatis
      setShowLocationModal(true);
      return;
    }

    try {
      const storeId = selectedStore.id; // Use selected store or default
      const response = await axiosInstance.post("/cart/items", {
        productId: product.id,
        quantity: quantity,
        storeId: Number(storeId),
      });

      showToast("Item added to cart successfully!", "success");

      // Refresh cart count
      await refreshCart();
    } catch (err: any) {
      console.error("Add to cart error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to add item to cart";
      showToast(errorMessage, "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Location Permission Modal */}
      <LocationPermissionModal
        isOpen={showLocationModal}
        onAccept={handleAcceptLocation}
        onDeny={handleDenyLocation}
        onSelectStore={handleManualStoreSelect}
      />

      {/* Navigation Bar */}
      <Navbar
        categories={homepageData?.navigation?.categories || []}
        featuredLinks={homepageData?.navigation?.featuredLinks || []}
        selectedStore={selectedStore}
        onStoreChange={handleStoreChange}
        onLocationRequest={() => setShowLocationModal(true)}
      />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection carousel={homepageData?.heroSection?.carousel || []} />

        {/* Store Information */}
        {selectedStore && (
          <div className="alert alert-info mb-4 mx-4">
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
        )}

        {/* Product List */}
        <ProductList
          products={homepageData?.productList.products || []}
          pagination={homepageData?.productList.pagination}
          loading={loading}
          onAddToCart={handleAddToCart}
        />
        <div className="mx-4">
          <Pagination
            currentPage={currentPage}
            totalPages={homepageData?.productList?.pagination?.totalPages || 1}
            onPageChange={handlePageChange}
            showInfo={true}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer footerData={homepageData?.footer} />
    </div>
  );
}

async function fetchCartCount() {
  try {
    const response = await axiosInstance.get("/cart");
    // Assuming the API returns cart data with items array
    const cartItemsCount = response.data?.data?.items?.length || 0;
    // You might want to update a cart count state or trigger a cart context update
    // For now, just log it or you could dispatch an event
    console.log("Cart items count:", cartItemsCount);
  } catch (err) {
    console.error("Failed to fetch cart count:", err);
  }
}
