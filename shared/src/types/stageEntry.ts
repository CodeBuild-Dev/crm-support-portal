// Pipeline stage tracking — populated by CRM webhooks

export interface StageEntry {
  id: string;
  dealId: string;
  stageName: string;
  enteredAt: Date;
  createdAt: Date;
}

// Payload shape sent by the CRM to POST /webhook/stage-change
export interface StageChangeWebhookPayload {
  dealId: string;
  stageName: string;
  timestamp: string; // ISO 8601
}

export type StageCountFilter = 'this_week' | 'last_week' | 'custom';

export interface StageCountQuery {
  stage_name: string;
  filter?: StageCountFilter;
  start_date?: string; // ISO date, required when filter=custom
  end_date?: string; // ISO date, required when filter=custom
}

export interface StageCountResponse {
  stage_name: string;
  count: number;
  start_date: string; // ISO
  end_date: string; // ISO
}
