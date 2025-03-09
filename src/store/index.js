// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import portfolioReducer from "./portfolioSlice";
import themeReducer from "./themeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    portfolio: portfolioReducer,
    theme: themeReducer,
  },
});
