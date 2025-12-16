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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Reset state ketika modal ditutup/dibuka
  useEffect(() => {
    if (!showUpload) {
      setFile(null);
      setPreviewUrl(null);
    }
    if (!showCancel) setReason("");
  }, [showUpload, showCancel]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

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
                onChange={handleFileChange}
              />
              <label className="label">
                <span className="label-text-alt">Max 1MB (JPG/PNG)</span>
              </label>
            </div>

            {/* Area Preview Gambar */}
            <div className="mt-4 p-2 border border-base-200 rounded-lg bg-base-100">
              {previewUrl ? (
                <>
                  <p className="text-xs text-center mb-2 text-gray-500">
                    Image Preview:
                  </p>
                  <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Payment Proof Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-lg bg-base-200/30 text-gray-400 text-sm gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  <span>No image selected</span>
                </div>
              )}
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
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal (Tetap Sama) */}
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
                className="btn btn-error text-white"
                disabled={!reason || loading}
                onClick={() => onCancel(reason)}
              >
                {loading ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal (Tetap Sama) */}
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
