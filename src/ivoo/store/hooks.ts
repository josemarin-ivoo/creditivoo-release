import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import type {IvoRootState} from './store';
import type {IvoAppDispatch} from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useIvoDispatch = () => useDispatch<IvoAppDispatch>();
export const useIvoSelector: TypedUseSelectorHook<IvoRootState> = useSelector;
