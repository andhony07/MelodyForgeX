export interface Project {
  id: string;
  name: string;
  description?: string | null;
  tempo: number;
  key: string;
  time_signature: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  tempo?: number;
  key?: string;
  time_signature?: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  tempo?: number;
  key?: string;
  time_signature?: string;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
}
