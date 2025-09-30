export interface FieldConfig {
  id: string;
  key: string; // The property key in the Weld interface
  label: string; // Display label for the field
  placeholder: string; // Placeholder text
  required: boolean;
  visible: boolean; // Whether the field is currently visible
  order: number; // Display order
  width?: number; // Column width as percentage (0-1)
  category: 'header' | 'table' | 'footer'; // Which section the field belongs to
}

export interface FieldCategory {
  id: string;
  name: string;
  fields: FieldConfig[];
  order: number;
}

export interface FormFieldConfig {
  categories: FieldCategory[];
  version: string; // For future migration support
  lastUpdated: string;
}

// Default field configurations
export const DEFAULT_FIELD_CONFIGS: FieldConfig[] = [
  // Header fields
  {
    id: 'date',
    key: 'date',
    label: 'Date',
    placeholder: 'Select Date',
    required: true,
    visible: true,
    order: 1,
    category: 'header',
    width: 0.2,
  },
  {
    id: 'weldingContractorName',
    key: 'weldingContractorName',
    label: 'Welder',
    placeholder: 'Name',
    required: false,
    visible: true,
    order: 2,
    category: 'header',
    width: 0.2,
  },
  {
    id: 'woJoNumber',
    key: 'woJoNumber',
    label: 'Location',
    placeholder: 'Job Location',
    required: false,
    visible: true,
    order: 3,
    category: 'header',
    width: 0.2,
  },
  
  // Table fields
  {
    id: 'weldNumber',
    key: 'weldNumber',
    label: 'WELD #',
    placeholder: 'Weld #',
    required: true,
    visible: true,
    order: 1,
    category: 'table',
    width: 0.1,
  },
  {
    id: 'widNumber',
    key: 'widNumber',
    label: 'WID #',
    placeholder: 'WID #',
    required: false,
    visible: true,
    order: 2,
    category: 'table',
    width: 0.1,
  },
  {
    id: 'pipeSizeInches',
    key: 'pipeSizeInches',
    label: 'PIPE SIZE',
    placeholder: 'Size',
    required: false,
    visible: true,
    order: 3,
    category: 'table',
    width: 0.11,
  },
  {
    id: 'typeOfWeld',
    key: 'typeOfWeld',
    label: 'MFG',
    placeholder: 'Type',
    required: false,
    visible: true,
    order: 4,
    category: 'table',
    width: 0.12,
  },
  {
    id: 'capSize',
    key: 'capSize',
    label: 'CAP SIZE',
    placeholder: 'Cap Size',
    required: false,
    visible: true,
    order: 5,
    category: 'table',
    width: 0.1,
  },
  {
    id: 'passes',
    key: 'passes',
    label: 'PASSES',
    placeholder: 'Passes',
    required: false,
    visible: true,
    order: 6,
    category: 'table',
    width: 0.12,
  },
  {
    id: 'wpsNumberAndTitle',
    key: 'wpsNumberAndTitle',
    label: 'WPS',
    placeholder: 'WPS #',
    required: false,
    visible: true,
    order: 7,
    category: 'table',
    width: 0.12,
  },
  {
    id: 'electrodeTypeBrand',
    key: 'electrodeTypeBrand',
    label: 'ELECTRODE',
    placeholder: 'Electrode',
    required: false,
    visible: true,
    order: 8,
    category: 'table',
    width: 0.12,
  },
  {
    id: 'rt',
    key: 'rt',
    label: 'RT',
    placeholder: 'RT',
    required: false,
    visible: true,
    order: 9,
    category: 'table',
    width: 0.09,
  },
  {
    id: 'htNumber',
    key: 'htNumber',
    label: 'HT #',
    placeholder: 'HT #',
    required: false,
    visible: true,
    order: 10,
    category: 'table',
    width: 0.12,
  },
  
  // Footer fields
  {
    id: 'weldSketch',
    key: 'weldSketch',
    label: 'Weld Sketch',
    placeholder: 'Upload sketch image',
    required: false,
    visible: true,
    order: 1,
    category: 'footer',
  },
  {
    id: 'welderSignature',
    key: 'welderSignature',
    label: 'Welder Signature',
    placeholder: 'Add signature',
    required: false,
    visible: true,
    order: 2,
    category: 'footer',
  },
  {
    id: 'weldSketchDescription',
    key: 'weldSketchDescription',
    label: 'Sketch Description',
    placeholder: 'Describe the sketch',
    required: false,
    visible: true,
    order: 3,
    category: 'footer',
  },
];
