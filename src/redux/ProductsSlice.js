import { createSlice } from "@reduxjs/toolkit";

const productsSlice = createSlice({
  name: "products",
  initialState: [],
  reducers: {
    addProduct: (state, action) => {
      state.push(action.payload);
    },
    deleteProduct: (state, action) => {
      return state.filter((product) => product.productId !== action.payload);
    },
    updateProduct: (state, action) => {
      const index = state.findIndex(
        (product) => product.productId === action.payload.productId
      );
      if (index !== -1) {
        const oldProduct = state[index]
        state[index] = { ...oldProduct, ...action.payload.updatedProduct };
      }
    },
  },
});

export const {
  addProduct,
  deleteProduct,
  updateProduct,
} = productsSlice.actions;

export const selectProductsList = (state) => state.products;

export default productsSlice.reducer;
