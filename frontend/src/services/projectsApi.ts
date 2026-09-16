import { apiClient } from './api';
import {
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  HealthCheckResponse,
} from '../types/project';

export const healthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get<HealthCheckResponse>('/health');
  return response.data;
};

export const getProjects = async (): Promise<Project[]> => {
  const response = await apiClient.get<Project[]>('/projects');
  return response.data;
};

export const getProject = async (id: string): Promise<Project> => {
  const response = await apiClient.get<Project>(`/projects/${id}`);
  return response.data;
};

export const createProject = async (
  payload: CreateProjectDTO
): Promise<Project> => {
  const response = await apiClient.post<Project>('/projects', payload);
  return response.data;
};

export const updateProject = async (
  id: string,
  payload: UpdateProjectDTO
): Promise<Project> => {
  const response = await apiClient.put<Project>(`/projects/${id}`, payload);
  return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await apiClient.delete(`/projects/${id}`);
};
