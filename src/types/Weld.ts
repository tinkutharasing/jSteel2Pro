export interface Weld {
  id: string;
  
  // Header Information
  welderName: string;
  date: string;
  welderCompany: boolean;
  welderContractor: boolean;
  loaTccMod: string;
  weldingContractorName: string;
  woJoNumber: string;
  weldingInspectorName: string;
  weldingInspectionCompany: string;
  jobLocation: string;
  numberOfWeldsMadeToday: string;
  stencilNumber: string;
  processUsed: string;
  
  // Weld Table Columns
  weldNumber: string;
  pipeSizeInches: string;
  butt: string;
  fillet: string;
  passes: string;
  oClockPosition: string;
  wpsNumberAndTitle: string;
  electrodeTypeBrand: string;
  gpsCoordinates: string;
  
  // Metadata
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface WeldFormData {
  // Header Information
  welderName: string;
  date: string;
  welderCompany: boolean;
  welderContractor: boolean;
  loaTccMod: string;
  weldingContractorName: string;
  woJoNumber: string;
  weldingInspectorName: string;
  weldingInspectionCompany: string;
  jobLocation: string;
  numberOfWeldsMadeToday: string;
  stencilNumber: string;
  processUsed: string;
  
  // Weld Table Columns
  weldNumber: string;
  pipeSizeInches: string;
  butt: string;
  fillet: string;
  passes: string;
  oClockPosition: string;
  wpsNumberAndTitle: string;
  electrodeTypeBrand: string;
  gpsCoordinates: string;
  
  // Metadata
  status: 'pending' | 'approved' | 'rejected';
}

export type Screen = 'home' | 'add' | 'view' | 'settings';
