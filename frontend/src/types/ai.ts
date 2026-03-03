export type Role = 'user' | 'assistant' | 'system';
 
export type Message = {
  id: string;
  role: Role;
  text: string;
  timestamp?: string;
};