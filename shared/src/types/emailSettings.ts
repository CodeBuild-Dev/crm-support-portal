export interface EmailSettings {
  id: string;
  enabled: boolean;
  fromName: string;
  closeSubject: string;
  closeBody: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateEmailSettingsInput {
  enabled?: boolean;
  fromName?: string;
  closeSubject?: string;
  closeBody?: string;
}
