import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const SidebarSlicer = createSlice({
  name: "Sidebar",
  initialState: {
    Route: null,
  },
  reducers: {
    setRoute: (state, action) => {
      state.Route = action.payload;
    },
  },
});

export const { setRoute } = SidebarSlicer.actions;

export default SidebarSlicer.reducer;
