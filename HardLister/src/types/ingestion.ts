/**
 * HardLister Image Ingestion & Role Pipeline Types
 * Defines data structures for Shooter (Vocal Dictation & Asset Capture)
 * and Monitor (Audit Queue & Serial Tag Verification) roles.
 */

import { HardGoodsItem } from './hardgoods';

export type RoleMode = 'Form' | 'Shooter' | 'Monitor';

export type VocalFieldKey =
  | 'title'
  | 'brand'
  | 'modelNumber'
  | 'serialNumber'
  | 'primaryCategory'
  | 'condition'
  | 'inspectionNotes';

export interface VocalFieldEntry {
  fieldKey: VocalFieldKey;
  label: string;
  value: string;
  confidence: number;
  isDictating: boolean;
  required?: boolean;
}

export type ManifestAuditStatus = 'Pending Audit' | 'Approved' | 'Flagged';

export interface ShooterManifest {
  manifestId: string;
  itemSKU: string;
  timestamp: string;
  vocalFields: Record<VocalFieldKey, string>;
  photos: {
    tagModel?: string;
    front?: string;
    back?: string;
    lSide?: string;
    rSide?: string;
    top?: string;
    bottom?: string;
  };
  highContrastTagActive: boolean;
  isConfirmed: boolean;
  itemData: Partial<HardGoodsItem>;
}

export interface MonitorQueueItem {
  id: string;
  manifest: ShooterManifest;
  status: ManifestAuditStatus;
  auditorNotes: string;
  contrastEnhanced: boolean;
  createdAt: string;
  updatedAt: string;
}
