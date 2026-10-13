export interface AiSettings {
  id: string;
  botName: string;
  systemPrompt: string;
  model: string;
  enabled: boolean;
  welcomeMessage: string;
  suggestions: string[];
  maxArticlesPerQuery: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicAiSettings {
  enabled: boolean;
  botName: string;
  welcomeMessage: string;
  suggestions: string[];
}

export interface UpdateAiSettingsInput {
  botName?: string;
  systemPrompt?: string;
  model?: string;
  enabled?: boolean;
  welcomeMessage?: string;
  suggestions?: string[];
  maxArticlesPerQuery?: number;
}
