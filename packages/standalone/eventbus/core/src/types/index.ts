/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Common types for event bus operations
 */

export enum EventPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum EventStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export interface EventMetadata {
  [key: string]: any;
}

export interface Event<T = any> {
  id: string;
  type: string;
  data: T;
  metadata?: EventMetadata;
  timestamp: Date;
  priority?: EventPriority;
  source?: string;
}

export interface EventHandler<T = any> {
  (event: Event<T>): Promise<void> | void;
}
