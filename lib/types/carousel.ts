/**
 * Carousel domain types
 *
 * Types for homepage carousel/banner management.
 */

import type { ID, Orderable, WithStatus } from "./common";

// ============================================================================
// Carousel Enums
// ============================================================================

/**
 * Carousel status values
 */
export type CarouselStatus = "active" | "inactive" | "scheduled";

// ============================================================================
// Carousel Types
// ============================================================================

/**
 * Carousel slide entity
 */
export interface CarouselSlide
  extends Orderable,
    WithStatus<CarouselStatus> {
  id: ID;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  imageKey: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Carousel for list/admin views
 */
export interface CarouselListItem extends CarouselSlide {
  isScheduled: boolean;
  isExpired: boolean;
}

/**
 * Carousel for public display (frontend)
 */
export interface CarouselPublic {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  backgroundColor: string | null;
  textColor: string | null;
}

// ============================================================================
// Carousel Filters
// ============================================================================

/**
 * Carousel list filter options
 */
export interface CarouselFilters {
  search?: string;
  status?: CarouselStatus | "all";
}

/**
 * Carousel sort fields
 */
export type CarouselSortField = "displayOrder" | "title" | "createdAt" | "status";

// ============================================================================
// Carousel Order Update
// ============================================================================

/**
 * Input for updating carousel display order
 */
export interface CarouselOrderUpdate {
  id: string;
  displayOrder: number;
}
