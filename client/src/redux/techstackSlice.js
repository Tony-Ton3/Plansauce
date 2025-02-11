import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentStack: null,
  error: null,
  loading: false,
};

const techstackSlice = createSlice({
  name: "stack",
  initialState,
  reducers: {
    setStackStart: (state) => {
      state.loading = false;
      state.error = null;
    },
    setStackSuccess: (state, action) => {
      state.currentStack = action.payload;
      state.loading = false;
      state.error = null;
    },
    setStackFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { setStackSuccess, setStackFailure } = techstackSlice.actions;

export default techstackSlice.reducer;