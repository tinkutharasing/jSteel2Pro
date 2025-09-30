export interface Weld {
  id: string;
  cardId: string; // Unique identifier for the card containing multiple welds
  
  // Header Information
  date: string;
  
  // Weld Table Columns - Simplified
  weldNumber: string;
  widNumber: string;
  pipeSizeInches: string;
  typeOfWeld: string;
  capSize: string;
  passes: string;
  wpsNumberAndTitle: string;
  electrodeTypeBrand: string;
  rt: string;
  htNumber?: string;
  
  // Legacy fields (kept for compatibility)
  welderCompany: boolean;
  welderContractor: boolean;
  loaTccMod: string;
  weldingContractorName: string;
  woJoNumber: string;
  weldingInspectorName: string;
  weldingInspectionCompany: string;
  numberOfWeldsMadeToday: string;
  stencilNumber: string;
  processUsed: string;
  butt: string;
  fillet: string;
  
  // Image Fields
  weldSketch?: string;
  weldSketchDescription?: string;
  
  // Signature Fields
  welderSignature?: string;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  
  // Allow additional custom fields
  [key: string]: any;
}

export interface WeldFormData {
  // Header Information
  cardId: string; // Unique identifier for the card containing multiple welds
  date: string;
  
  // Weld Table Columns - Simplified
  weldNumber: string;
  widNumber: string;
  pipeSizeInches: string;
  typeOfWeld: string;
  capSize: string;
  passes: string;
  wpsNumberAndTitle: string;
  electrodeTypeBrand: string;
  rt: string;
  htNumber?: string;
  
  // Legacy fields (kept for compatibility)
  welderCompany: boolean;
  welderContractor: boolean;
  loaTccMod: string;
  weldingContractorName: string;
  woJoNumber: string;
  weldingInspectorName: string;
  weldingInspectionCompany: string;
  numberOfWeldsMadeToday: string;
  stencilNumber: string;
  processUsed: string;
  butt: string;
  fillet: string;
  
  // Image Fields
  weldSketch: string;
  weldSketchDescription: string;
  
  // Signature Fields
  welderSignature: string;
  
  // Allow additional dynamic fields from field management
  [key: string]: any;
}

export type Screen = 'home' | 'view' | 'bulk-edit';
