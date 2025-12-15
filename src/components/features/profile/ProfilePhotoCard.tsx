import React from "react";

interface Props {
  user: any;
  previewUrl: string | null;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfilePhotoCard: React.FC<Props> = ({
  user,
  previewUrl,
  onPhotoChange,
}) => {
  return (
    <div className="card bg-base-100 shadow-lg border border-base-200">
      <div className="card-body items-center text-center p-6">
        <h2 className="card-title text-lg mb-2">Profile Photo</h2>
        <div className="avatar mb-4 group relative">
          <div className="w-32 md:w-40 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100 overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="bg-neutral text-neutral-content w-full h-full flex items-center justify-center text-5xl font-bold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="w-full">
          <label className="btn btn-sm btn-outline btn-primary w-full mb-2 cursor-pointer">
            Change Photo
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif"
              className="hidden"
              onChange={onPhotoChange}
            />
          </label>
          <p className="text-xs text-base-content/50">
            Max size: 1MB (JPG, PNG)
          </p>
        </div>
      </div>
    </div>
  );
};
export default ProfilePhotoCard;
