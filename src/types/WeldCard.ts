import { Weld } from './Weld';

export interface WeldCardData {
  cardId: string;
  date: string;
  weldSketch?: string;
  weldSketchDescription?: string;
  defectSketch?: string;
  defectSketchDescription?: string;
  welds: Weld[];
  createdAt?: string;
  updatedAt?: string;
}
