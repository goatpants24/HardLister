/**
 * HardLister Structural Type Engine
 * Enforces hard parameters for spec-driven durable inventory.
 */

export type HardGoodsCategory = 'Tools' | 'Appliances' | 'Electronics' | 'Camera Gear';
export type MechanicalCondition = 'NIB' | 'Open Box' | 'Excellent' | 'Good' | 'Fair' | 'Parts';
export type AssetStatus = 'Available' | 'Sold' | 'Returned';

export interface BaseHardGoodsItem {
  itemNumber: string;         // Unique identification SKU layout (e.g., YYHL###)
  title: string;              // Specific descriptive listing name
  brand: string;              // Manufacturer / Label
  modelNumber: string;        // Exact model/part key string (Forced constraint)
  serialNumber: string;       // Mandatory asset serial text string
  primaryCategory: HardGoodsCategory;
  condition: MechanicalCondition;
  saleStatus: AssetStatus;
  listedPrice: number;
  marketplace: string;        // eBay, FB Marketplace, OfferUp, Direct
  driveFolderId: string;      // Linked Google Drive binary file pointer
  inspectionNotes: string;    // Operational validation and fault ledger strings
  dateListed: string;         // ISO YYYY-MM-DD
}

export interface ToolsExtension {
  toolSubCategory: 'Hand Tool' | 'Power Tool';
  powerSource: 'Manual' | 'Cordless' | 'Corded' | 'Pneumatic';
  voltageOrPower: string;     // e.g., "20V Max", "120V AC", "N/A"
  batteryEcosystem: string;   // e.g., "DeWalt 20V", "Milwaukee M18", "None"
}

export interface AppliancesExtension {
  applianceType: 'Countertop Small' | 'Major Appliance' | 'Coffee/Espresso';
  powerRequirement: string;   // e.g., "110V/120V", "220V/240V"
  wattage: number;            // Operational current load metric
  exteriorFinish: string;     // e.g., "Stainless Steel", "Matte Black"
}

export interface ElectronicsExtension {
  deviceType: 'Laptop' | 'Tablet' | 'GPS/Navigation' | 'Audio';
  processorSpecs: string;     // e.g., "Apple M1 Pro Max", "Intel i7"
  storageRamProfile: string;  // e.g., "16GB RAM / 512GB SSD"
  batteryHealthPct: number;   // Maximum charge operational status marker
  isActivationUnlocked: boolean; // Explicit validation safety switch
}

export interface CameraGearExtension {
  gearType: 'Camera Body' | 'Lens' | 'Lighting' | 'Audio/Mic';
  lensMount: 'Sony E' | 'Canon RF' | 'Canon EF' | 'Nikon Z' | 'PL Mount' | 'N/A';
  shutterCountOrHours: number; // Mechanical actuation step metric
  opticalStatus: 'Pristine' | 'Minor Dust' | 'Element Scratched' | 'Haze/Fungus';
  includedKitAccessories: string; // Serialized bundle description text
}

export type HardGoodsItem = BaseHardGoodsItem & 
  Partial<ToolsExtension> & 
  Partial<AppliancesExtension> & 
  Partial<ElectronicsExtension> & 
  Partial<CameraGearExtension>;