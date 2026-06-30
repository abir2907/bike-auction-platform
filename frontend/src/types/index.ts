export type Role = 'USER' | 'ADMIN';
export type FuelType = 'PETROL' | 'ELECTRIC' | 'HYBRID';
export type Transmission = 'MANUAL' | 'AUTOMATIC';
export type ListingType = 'SALE' | 'AUCTION';
export type ListingStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'SOLD' | 'REJECTED' | 'ARCHIVED';
export type AuctionStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'SETTLED' | 'CANCELLED';
export type InquiryStatus = 'NEW' | 'CONTACTED' | 'CLOSED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  avatarUrl?: string | null;
  emailVerified: boolean;
  isActive?: boolean;
  createdAt: string;
}

export interface VehicleImage {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Seller {
  id: string;
  name: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface Vehicle {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  variant?: string | null;
  year: number;
  fuelType: FuelType;
  transmission: Transmission;
  kmDriven: number;
  ownerCount: number;
  engineCapacityCc?: number | null;
  color?: string | null;
  registrationState?: string | null;
  city: string;
  description: string;
  price: string;
  conditionScore: number;
  listingType: ListingType;
  status: ListingStatus;
  featured: boolean;
  viewCount: number;
  images: VehicleImage[];
  seller?: Seller;
  auction?: Auction | null;
  createdAt: string;
}

export interface Auction {
  id: string;
  vehicleId: string;
  startingPrice: string;
  reservePrice?: string | null;
  buyNowPrice?: string | null;
  bidIncrement: string;
  currentPrice: string;
  startTime: string;
  endTime: string;
  antiSnipeSeconds: number;
  status: AuctionStatus;
  totalBids: number;
  reserveMet: boolean;
  winnerId?: string | null;
  winner?: { id: string; name: string } | null;
  vehicle?: Vehicle;
}

export interface Bid {
  id: string;
  auctionId: string;
  amount: string;
  createdAt: string;
  bidder?: { id: string; name: string };
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorTitle?: string | null;
  avatarUrl?: string | null;
  rating: number;
  content: string;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface Inquiry {
  id: string;
  vehicleId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  vehicle?: { id: string; title: string; slug: string };
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PageMeta;
}

export interface PlatformStats {
  vehiclesListed: number;
  vehiclesSold: number;
  happyCustomers: number;
  liveAuctions: number;
}
