import React, { useEffect, useState } from "react";

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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay for animation
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`modal ${isVisible ? "modal-open" : ""}`}>
      <div className="modal-box">
        <div className="flex items-center gap-4 mb-6">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-12">
              <span className="text-xl">📍</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg">Location Access</h3>
            <p className="text-sm text-gray-500">
              For a better shopping experience
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="badge badge-primary badge-sm mt-1">✓</div>
            <div>
              <h4 className="font-medium">Personalized Store Selection</h4>
              <p className="text-sm text-gray-600">
                See products available at stores near you
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="badge badge-primary badge-sm mt-1">✓</div>
            <div>
              <h4 className="font-medium">Accurate Shipping Estimates</h4>
              <p className="text-sm text-gray-600">
                Get precise delivery times based on your location
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="badge badge-primary badge-sm mt-1">✓</div>
            <div>
              <h4 className="font-medium">Location-based Promotions</h4>
              <p className="text-sm text-gray-600">
                Receive special offers from nearby stores
              </p>
            </div>
          </div>
        </div>

        <div className="bg-base-200 rounded-lg p-4 mb-6">
          <p className="text-sm">
            <span className="font-medium">Note:</span> Your location data is
            only used to show relevant products and is never shared with third
            parties. You can change this permission anytime in your browser
            settings.
          </p>
        </div>

        <div className="modal-action">
          <button className="btn btn-outline" onClick={onDeny}>
            Maybe Later
          </button>
          <button className="btn btn-primary" onClick={onAccept}>
            Allow Location Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;