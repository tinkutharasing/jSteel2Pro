import { Weld } from './Weld';

export interface WeldCardData {
  cardId: string;
  date: string;
  weldSketch?: string;
  weldSketchDescription?: string;
  welderSignature?: string;
  welds: Weld[];
  createdAt?: string;
  updatedAt?: string;
}
