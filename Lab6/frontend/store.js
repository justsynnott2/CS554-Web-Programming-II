import { configureStore } from '@reduxjs/toolkit';
import trainerReducer from './reducers/trainerReducer';

const store = configureStore({reducer: {trainers: trainerReducer}});

export default store;
