// src/types/form.ts
export type FieldType = 'text' | 'select' | 'hidden' | 'number' | 'checkbox' | 'radio' | 'nested';

export interface FormField {
  name: string;
  type: FieldType;
  value?: any;
  validation?: {
    required?: boolean;
    pattern?: RegExp;
    min?: number;
    max?: number;
    custom?: (value: any) => boolean;
  };
  fields?: FormField[]; // Para campos aninhados
}

export interface FormFieldRegistration {
  componentId: string;
  fields: FormField[];
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}