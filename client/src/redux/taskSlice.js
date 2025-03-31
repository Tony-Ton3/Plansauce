import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentTasks: null,
  error: null,
  loading: false,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasksSuccess: (state, action) => {
      state.currentTasks = action.payload;
      state.loading = false;
      state.error = null;
    },
    setTasksStart: (state) => {
      state.loading = false;
      state.error = null;
    },
    setTasksFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearTasks: (state) => {
      state.currentTasks = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setTasksStart,
  setTasksSuccess,
  setTasksFailure,
  clearTasks,
} = taskSlice.actions;

export default taskSlice.reducer;