import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import type {RootState} from '../../../../redux/store';
import type {AppDispatch} from '../../../../redux/store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useIvoDispatch = () => useDispatch<AppDispatch>();
export const useIvoSelector: TypedUseSelectorHook<RootState> = useSelector;
