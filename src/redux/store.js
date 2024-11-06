import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../redux/slice/counterSlice';
import userReducer from '../redux/slice/userSlice';
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
  },
});
