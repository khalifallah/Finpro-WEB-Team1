'use client';

import ConfirmDialog from '@/components/common/ConfirmDialog';

interface UserDeleteDialogProps {
  isOpen: boolean;
  userName?: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function UserDeleteDialog({
  isOpen,
  userName,
  loading,
  onClose,
  onConfirm,
}: UserDeleteDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete User"
      message={`Are you sure you want to delete "${userName}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
      loading={loading}
    />
  );
}