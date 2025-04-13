import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjectsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setProjectsSuccess: (state, action) => {
      state.projects = action.payload;
      state.loading = false;
      state.error = null;
    },
    setProjectsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentProject: (state, action) => {
      console.log("Setting current project with data:", action.payload);
      console.log("Tech stack data:", action.payload.techStack);
      state.currentProject = action.payload;
    },
    clearProjects: (state) => {
      state.projects = [];
      state.currentProject = null;
      state.loading = false;
      state.error = null;
    }
  },
});

export const {
  setProjectsStart,
  setProjectsSuccess,
  setProjectsFailure,
  setCurrentProject,
  clearProjects
} = projectSlice.actions;

export default projectSlice.reducer; 