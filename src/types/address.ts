export interface UserAddress {
  id: number;
  userId: number;
  label?: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  recipientName: string;
  recipientPhone?: string;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  label?: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  recipientName: string;
  recipientPhone?: string;
  isMain?: boolean;
}

export interface UpdateAddressData {
  label?: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  recipientName?: string;
  recipientPhone?: string;
  isMain?: boolean;
}
