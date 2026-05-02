import type { NodePosition, NodeDef, EdgeDef } from './types';

export const MICA_ORANGE = '#FF7A00';
export const MICA_ORANGE_DIM = 'rgba(255,122,0,0.18)';
export const MICA_ORANGE_GLOW = 'rgba(255,122,0,0.7)';
// Slightly warmer, more on-brand node background with subtle orange glow
export const NODE_BG =
  'radial-gradient(circle at 30% 15%, rgba(255,122,0,0.24), rgba(8,10,26,0.96))';
export const LABEL_COLOR = 'rgba(255,255,255,0.6)';

export const NODE_POSITIONS: Record<string, NodePosition> = {
  start:        { x: 240,  y: 420,  r: 82  },
  productName:  { x: 500,  y: 320,  r: 130 },
  whatDoesItDo: { x: 620,  y: 610,  r: 130 },
  whoIsItFor:   { x: 860,  y: 380,  r: 120 },
  hasDate:      { x: 1080, y: 240,  r: 114 },
  datePicker:   { x: 1090, y: 430,  r: 114 },
  hasBudget:    { x: 1330, y: 430,  r: 114 },
  howMuch:      { x: 1330, y: 630,  r: 114 },
  location:     { x: 1620, y: 280,  r: 114 },
  tone:         { x: 1730, y: 830,  r: 145 },
  attachDoc:    { x: 2050, y: 830,  r: 110 },
  customerData: { x: 2270, y: 1050, r: 110 },
  letsGo:       { x: 1880, y: 1120, r: 88  },
};

export const NODES: NodeDef[] = [
  { id: 'start',        label: 'Start',                   inputType: 'button' },
  { id: 'productName',  label: 'Product Name',             inputType: 'text',     placeholder: 'Name of your product or event.',           valueKey: 'name' },
  { id: 'whatDoesItDo', label: "What does it do?",         inputType: 'textarea', placeholder: 'Product details, registration links and more',     valueKey: 'desc' },
  { id: 'whoIsItFor',   label: 'Who is it for?',          inputType: 'text',     placeholder: 'Your target audience',      valueKey: 'audience' },
  { id: 'hasDate',      label: 'Does it have a date?',    inputType: 'yesno' },
  { id: 'datePicker',   label: 'Select Date',             inputType: 'date',     valueKey: 'date' },
  { id: 'hasBudget',    label: 'Have a budget in mind?',  inputType: 'yesno' },
  { id: 'howMuch',      label: 'How much?',               inputType: 'text',     placeholder: 'e.g. 50000',                   valueKey: 'budgetAmount' },
  { id: 'location',     label: 'Location',                inputType: 'text',     placeholder: 'Any city / village / area',    valueKey: 'location' },
  { id: 'tone',         label: 'Which tone do you prefer?', inputType: 'choice', choices: ['Casual :)', 'Warm & Inspirational', 'Urgent!', 'Professional', 'Custom'], valueKey: 'tone' },
  { id: 'attachDoc',    label: 'Want to attach a product doc?', inputType: 'yesno' },
  { id: 'customerData', label: 'Do you have customer data?',    inputType: 'yesno' },
  { id: 'letsGo',       label: "Generate tone preview",    inputType: 'button' },
];

export const EDGES: EdgeDef[] = [
  { id: 'e1',  from: 'start',       to: 'productName' },
  { id: 'e2',  from: 'productName', to: 'whatDoesItDo' },
  { id: 'e3',  from: 'productName', to: 'whoIsItFor' },
  { id: 'e4',  from: 'productName', to: 'hasDate' },
  { id: 'e5',  from: 'hasDate',     to: 'datePicker',  condNode: 'hasDate',   condValue: true },
  { id: 'e6',  from: 'datePicker',  to: 'hasBudget',   condNode: 'hasDate',   condValue: true },
  { id: 'e7',  from: 'hasDate',     to: 'hasBudget',   condNode: 'hasDate',   condValue: false },
  { id: 'e8',  from: 'hasBudget',   to: 'howMuch',     condNode: 'hasBudget', condValue: true },
  { id: 'e9',  from: 'howMuch',     to: 'location',    condNode: 'hasBudget', condValue: true },
  { id: 'e10', from: 'hasBudget',   to: 'location',    condNode: 'hasBudget', condValue: false },
  { id: 'e11', from: 'location',    to: 'tone' },
  { id: 'e12', from: 'tone',        to: 'attachDoc' },
  { id: 'e13', from: 'attachDoc',    to: 'customerData' },
  { id: 'e14', from: 'customerData', to: 'letsGo' },
];

export const STEP_TOTAL = 12;

export const SPRING_PAN = { stiffness: 44, damping: 26 };
export const SPRING_SCALE = { stiffness: 65, damping: 18 };
export const DRIFT_FACTOR = 0.02;
export const DRIFT_MAX = 20;
export const DRAG_ELASTIC = 0.15;
