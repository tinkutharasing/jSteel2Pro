export interface Weld {
  id: string;
  
  // Header Information
  welderName: string;
  date: string;
  jobLocation: string;
  
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
  defectSketch?: string;
  defectSketchDescription?: string;
  
  // Metadata
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface WeldFormData {
  // Header Information
  welderName: string;
  date: string;
  jobLocation: string;
  
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
  defectSketch: string;
  defectSketchDescription: string;
  
  // Metadata
  status: 'pending' | 'approved' | 'rejected';
}

export type Screen = 'home' | 'add' | 'view' | 'settings' | 'bulk-edit';
