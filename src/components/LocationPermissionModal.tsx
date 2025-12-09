import { axiosInstance } from "@/libs/axios/axios.config";
import React, { useEffect, useState } from "react";
import { FaStar, FaClock } from "react-icons/fa";

interface Store {
  id: number;
  name: string;
  address: string;
  distance: number;
  rating: number;
  deliveryTime: string;
}

interface LocationPermissionModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDeny: () => void;
  onSelectStore: (store: Store) => void;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onAccept,
  onDeny,
  onSelectStore,
}) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Fetch nearby stores when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchNearbyStores();
    }
  }, [isOpen]);

  const fetchNearbyStores = async () => {
    setIsLoading(true);
    try {
      const storedLocation = localStorage.getItem("userLocation");
      let params = {};

      if (storedLocation) {
        const { latitude, longitude } = JSON.parse(storedLocation);
        // Kirim lat & lng ke Backend agar backend bisa hitung jarak
        params = { lat: latitude, lng: longitude };
      }

      // 2. [UPDATE] Panggil API dengan params lokasi
      const response = await axiosInstance.get("/stores", { params });
      console.log("Response Raw:", response); // Debugging

      const storesFromApi = response.data?.data?.stores || [];

      const formattedStores = storesFromApi.map((store: any) => ({
        id: store.id,
        name: store.name,
        address: store.address,
        distance: 0, // Default karena API belum return distance
        rating: 4.5, // Default
        deliveryTime: "15-30 min", // Default
      }));

      setStores(formattedStores);

      // Auto-select toko pertama jika ada
      if (formattedStores.length > 0) {
      }
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSelect = (store: Store) => {
    setSelectedStore(store);
  };

  const handleContinue = () => {
    if (selectedStore) {
      // [ACTION] Kirim data toko asli ke Page.tsx
      onSelectStore(selectedStore);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-10">
              <span className="text-lg">📍</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg">Choose Your Store</h3>
            <p className="text-sm text-gray-500">Select a store for delivery</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {/* Store List */}
            <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedStore?.id === store.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                  onClick={() => handleSelect(store)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{store.name}</h4>
                        <div className="badge badge-primary badge-sm">
                          {store.distance} km
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {store.address}
                      </p>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-500" />
                          <span>{store.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaClock className="text-gray-500" />
                          <span>{store.deliveryTime}</span>
                        </div>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="store"
                      checked={selectedStore?.distance === store.id}
                      onChange={() => handleSelect(store)}
                      className="radio radio-primary"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Location Permission Section */}
            <div className="bg-base-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="badge badge-primary badge-lg p-2">📍</div>
                <div>
                  <h4 className="font-semibold">Use My Current Location</h4>
                  <p className="text-sm text-gray-600">
                    Get accurate delivery times and the closest store
                  </p>
                </div>
              </div>
              <button onClick={onAccept} className="btn btn-primary btn-block">
                Allow Location Access
              </button>
            </div>
          </>
        )}

        <div className="modal-action">
          <button onClick={onDeny} className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleContinue}
            className="btn btn-primary"
            disabled={!selectedStore}
          >
            Continue with Selected Store
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
