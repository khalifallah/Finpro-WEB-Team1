// src/components/orders/OrderModals.tsx
import React, { useState, useEffect } from "react";

interface OrderModalsProps {
  showUpload: boolean;
  onCloseUpload: () => void;
  onUpload: (file: File) => void;

  showCancel: boolean;
  onCloseCancel: () => void;
  onCancel: (reason: string) => void;

  showConfirm: boolean;
  onCloseConfirm: () => void;
  onConfirm: () => void;

  loading: boolean;
}

export const OrderModals: React.FC<OrderModalsProps> = ({
  showUpload,
  onCloseUpload,
  onUpload,
  showCancel,
  onCloseCancel,
  onCancel,
  showConfirm,
  onCloseConfirm,
  onConfirm,
  loading,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [reason, setReason] = useState("");

  // Reset state ketika modal ditutup/dibuka
  useEffect(() => {
    if (!showUpload) setFile(null);
    if (!showCancel) setReason("");
  }, [showUpload, showCancel]);

  return (
    <>
      {/* Upload Modal */}
      {showUpload && (
        <div className="modal modal-open z-50">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Upload Payment Proof</h3>
            <div className="form-control w-full">
              <input
                type="file"
                className="file-input file-input-bordered w-full"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label className="label">
                <span className="label-text-alt">Max 1MB (JPG/PNG)</span>
              </label>
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={onCloseUpload}
                disabled={loading}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                disabled={!file || loading}
                onClick={() => file && onUpload(file)}
              >
                {loading ? "Uploading..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancel && (
        <div className="modal modal-open z-50">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Cancel Order</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure? This action cannot be undone.
            </p>
            <textarea
              className="textarea textarea-bordered w-full mt-4"
              placeholder="Reason for cancellation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="modal-action">
              <button
                className="btn"
                onClick={onCloseCancel}
                disabled={loading}
              >
                Back
              </button>
              <button
                className="btn btn-error"
                disabled={!reason || loading}
                onClick={() => onCancel(reason)}
              >
                {loading ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="modal modal-open z-50">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-success">Order Received?</h3>
            <p className="py-4">
              Please confirm that you have received the products in good
              condition.
            </p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={onCloseConfirm}
                disabled={loading}
              >
                Not Yet
              </button>
              <button
                className="btn btn-success text-white"
                disabled={loading}
                onClick={onConfirm}
              >
                {loading ? "Processing..." : "Yes, Received"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
