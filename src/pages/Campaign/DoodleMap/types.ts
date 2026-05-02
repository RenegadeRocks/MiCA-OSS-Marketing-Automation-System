export interface NodePosition {
  x: number;
  y: number;
  r: number;
}

export interface NodeDef {
  id: string;
  label: string;
  inputType: 'button' | 'text' | 'textarea' | 'date' | 'yesno' | 'choice';
  placeholder?: string;
  valueKey?: string;
  choices?: string[];
}

export interface EdgeDef {
  id: string;
  from: string;
  to: string;
  condNode?: string;
  condValue?: boolean;
}

export interface FormValues {
  name: string;
  desc: string;
  audience: string;
  date: string;
  budgetAmount: string;
  location: string;
  tone: string;
  customTone: string;
  attachedDocUrl: string;
  attachedDocName: string;
  customerDataUrl: string;
  customerDataName: string;
}

export interface WobbleBorderRadius {
  tl1: number; tr1: number; br1: number; bl1: number;
  tl2: number; tr2: number; br2: number; bl2: number;
}
