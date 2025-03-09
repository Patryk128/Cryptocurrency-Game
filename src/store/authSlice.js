// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // Będzie teraz zwykłym obiektem lub null
  },
  reducers: {
    setUser: (state, action) => {
      const user = action.payload;
      state.user = user
        ? {
            uid: user.uid,
            email: user.email,
            // Dodaj inne potrzebne pola, np. displayName, jeśli używasz
          }
        : null;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
