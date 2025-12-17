// ivoo-app/useIvo.ts (Ahora es TypeScript)

import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
// Importamos los tipos desde el archivo de declaración
import type {RootState, AppDispatch} from './store.d'; 

// Las declaraciones de tipos ahora son válidas aquí.
export const useIvoDispatch = () => useDispatch<AppDispatch>();
export const useIvoSelector: TypedUseSelectorHook<RootState> = useSelector;
