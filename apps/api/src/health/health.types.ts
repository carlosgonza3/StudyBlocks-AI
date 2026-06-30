export type HealthStatus = {
  status: 'ok';
  service: 'studyblocks-api';
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
};
