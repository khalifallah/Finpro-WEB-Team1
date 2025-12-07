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
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onAccept,
  onDeny,
}) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  // Fetch nearby stores when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchNearbyStores();
    }
  }, [isOpen]);

  const fetchNearbyStores = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from your API
      // For demo, we'll use mock data
      const mockStores: Store[] = [
        {
          id: 1,
          name: "Beyond Market Central",
          address: "123 Main St, City Center",
          distance: 1.2,
          rating: 4.5,
          deliveryTime: "15-25 min"
        },
        {
          id: 2,
          name: "Beyond Market North",
          address: "456 North Ave, North District",
          distance: 2.8,
          rating: 4.2,
          deliveryTime: "25-35 min"
        },
        {
          id: 3,
          name: "Beyond Market East",
          address: "789 East Blvd, East Side",
          distance: 3.5,
          rating: 4.7,
          deliveryTime: "30-40 min"
        }
      ];
      setStores(mockStores);
      setSelectedStoreId(mockStores[0]?.id || null);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    } finally {
      setIsLoading(false);
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
                    selectedStoreId === store.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedStoreId(store.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{store.name}</h4>
                        <div className="badge badge-primary badge-sm">
                          {store.distance} km
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                      
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
                      checked={selectedStoreId === store.id}
                      onChange={() => setSelectedStoreId(store.id)}
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
              <button
                onClick={onAccept}
                className="btn btn-primary btn-block"
              >
                Allow Location Access
              </button>
            </div>
          </>
        )}

        <div className="modal-action">
          <button 
            onClick={onDeny} 
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              // Handle store selection
              if (selectedStoreId) {
                console.log("Selected store:", selectedStoreId);
                onDeny(); // Close modal
              }
            }}
            className="btn btn-primary"
            disabled={!selectedStoreId}
          >
            Continue with Selected Store
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;