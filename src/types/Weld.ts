export interface Weld {
  id: string;
  date: string;
  typeFit: string;
  wps: string;
  pipeDia: string;
  gradeClass: string;
  weldNumber: string;
  welder: string;
  welderSignature: string;
  inspector: string;
  inspectorSignature: string;
  firstHT: string;
  firstMfg: string;
  firstLength: string;
  jtNumber: string;
  secondHT: string;
  secondMfg: string;
  secondLength: string;
  preHeat: string;
  vt: string;
  process: string;
  ndeNumber: string;
  amps: string;
  volts: string;
  ipm: string;
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  createdAt?: string;
  updatedAt?: string;
}

export interface WeldFormData {
  date: string;
  typeFit: string;
  wps: string;
  pipeDia: string;
  gradeClass: string;
  weldNumber: string;
  welder: string;
  welderSignature: string;
  inspector: string;
  inspectorSignature: string;
  firstHT: string;
  firstMfg: string;
  firstLength: string;
  jtNumber: string;
  secondHT: string;
  secondMfg: string;
  secondLength: string;
  preHeat: string;
  vt: string;
  process: string;
  ndeNumber: string;
  amps: string;
  volts: string;
  ipm: string;
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
}

export type Screen = 'home' | 'add' | 'view' | 'settings';
