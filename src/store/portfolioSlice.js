import { createSlice } from "@reduxjs/toolkit";

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState: {
    balance: 10000,
    portfolio: {},
    prices: {},
  },
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
    setPortfolio: (state, action) => {
      state.portfolio = action.payload;
    },
    setPrices: (state, action) => {
      state.prices = action.payload;
    },
  },
});

export const { setBalance, setPortfolio, setPrices } = portfolioSlice.actions;
export default portfolioSlice.reducer;
