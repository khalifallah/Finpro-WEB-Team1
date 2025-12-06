export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'STORE_ADMIN' | 'USER';
  storeId?: number;
  store?: {
    id: number;
    name: string;
    location: string;
  };
  profilePhoto?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  password: string;
  role: 'STORE_ADMIN';
  storeId: number;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  password?: string;
  storeId?: number;
}

export interface UserListResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
}