export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface QuickAction {
  label: string;
  message: string;
}
