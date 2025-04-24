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
    setTasksStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setTasksSuccess: (state, action) => {
      state.currentTasks = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateTaskStatus: (state, action) => {
      const { taskId, completed } = action.payload;
      if (state.currentTasks) {
        state.currentTasks = state.currentTasks.map(task => {
          if (task.taskId === taskId || task.id === taskId || task._id === taskId) {
            return { ...task, completed };
          }
          return task;
        });
      }
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
  updateTaskStatus,
} = taskSlice.actions;

export default taskSlice.reducer;