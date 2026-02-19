export interface ShopProduct {
  id: string
  name: string
  slug: string
  description: string | null
  basePrice: number
  primaryImage: string | null
  categories: string[]
  sizes: ShopProductSize[]
  createdAt: Date
}

export interface ShopProductDetail extends ShopProduct {
  images: ShopProductImage[]
}

export interface ShopProductImage {
  id: string
  url: string
  altText: string | null
  isPrimary: boolean
}

export interface ShopProductSize {
  id: string
  name: string
  stock: number
  sku: string | null
}

export interface CategoryNode {
  id: string
  name: string
  slug: string
  level: number
  productCount: number
  children: CategoryNode[]
}

export interface ShopFilters {
  categories: string[] // Now stores slugs instead of IDs
  priceMin: number | null
  priceMax: number | null
  search: string
  sortBy: 'name' | 'price' | 'date'
  sortOrder: 'asc' | 'desc'
  page: number
  perPage: number
}

export interface ShopPagination {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface ShopProductsResponse {
  products: ShopProduct[]
  pagination: ShopPagination
}

export type SortOption = {
  value: string
  label: string
  sortBy: 'name' | 'price' | 'date'
  sortOrder: 'asc' | 'desc'
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'name-asc', label: 'Name A-Z', sortBy: 'name', sortOrder: 'asc' },
  { value: 'name-desc', label: 'Name Z-A', sortBy: 'name', sortOrder: 'desc' },
  { value: 'price-asc', label: 'Price Low-High', sortBy: 'price', sortOrder: 'asc' },
  { value: 'price-desc', label: 'Price High-Low', sortBy: 'price', sortOrder: 'desc' },
  { value: 'date-desc', label: 'Newest First', sortBy: 'date', sortOrder: 'desc' },
  { value: 'date-asc', label: 'Oldest First', sortBy: 'date', sortOrder: 'asc' },
]

export const PER_PAGE_OPTIONS = [12, 24, 48]

export interface PendingShopFilters {
  categories: string[] // Now stores slugs instead of IDs
  priceMin: number | null
  priceMax: number | null
}

export interface FilterValidationError {
  field: string
  message: string
}
