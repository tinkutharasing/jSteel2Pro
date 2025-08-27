declare module 'react-native-android-document-picker' {
  export interface DocumentPickerResult {
    uri: string;
    type: string;
    name: string;
    size: number;
  }

  export interface DocumentPickerOptions {
    type?: string[];
    multiple?: boolean;
    readContent?: boolean;
  }

  export default class DocumentPicker {
    static pick(options?: DocumentPickerOptions): Promise<DocumentPickerResult[]>;
    static pickMultiple(options?: DocumentPickerOptions): Promise<DocumentPickerResult[]>;
    static pickSingle(options?: DocumentPickerOptions): Promise<DocumentPickerResult>;
    static types: {
      csv: string;
      allFiles: string;
    };
    static isCancel(error: any): boolean;
  }
}
