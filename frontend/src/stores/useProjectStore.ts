import { create } from 'zustand';
import { Project, CreateProjectDTO } from '../types/project';
import * as projectsApi from '../services/projectsApi';

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  loading: boolean;
  error: string | null;
  apiConnected: boolean;

  checkHealth: () => Promise<boolean>;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectDTO) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (project: Project | null) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProject: null,
  loading: false,
  error: null,
  apiConnected: false,

  checkHealth: async () => {
    try {
      const res = await projectsApi.healthCheck();
      const isOk = res.status === 'ok';
      set({ apiConnected: isOk });
      return isOk;
    } catch {
      set({ apiConnected: false });
      return false;
    }
  },

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await projectsApi.getProjects();
      set({ projects, loading: false, apiConnected: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch projects';
      set({ error: message, loading: false, apiConnected: false });
    }
  },

  createProject: async (data: CreateProjectDTO) => {
    set({ loading: true, error: null });
    try {
      const newProject = await projectsApi.createProject(data);
      set((state) => ({
        projects: [newProject, ...state.projects],
        loading: false,
        apiConnected: true,
      }));
      return newProject;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  deleteProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await projectsApi.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        activeProject: state.activeProject?.id === id ? null : state.activeProject,
        loading: false,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete project';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  setActiveProject: (project: Project | null) => {
    set({ activeProject: project });
  },

  clearError: () => {
    set({ error: null });
  },
}));
