import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  email: '',
  access_token: '',
  role: '',
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser: (state, action) => {
      const { name, email, access_token } = action.payload;
      state.name = name;
      state.email = email;
      state.role = action.payload.role || state.role;
      state.access_token = access_token;
    },
    resetUser: (state) => {
      state.name = '';
      state.email = '';
      state.access_token = '';
      state.role = '';
    },
  },
});

export const { updateUser, resetUser } = userSlice.actions;

export default userSlice.reducer;
