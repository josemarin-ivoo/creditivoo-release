type RootReducerFunction = typeof import('./store').rootReducer;

// 2. Define RootState como el tipo de retorno de esa función. 
// Esto incluirá la estructura anidada: { creditivoo: { auth: ... } }
export type RootState = ReturnType<RootReducerFunction>;

// 3. Define AppDispatch (usando typeof para el 'dispatch' de la instancia del store)
export type AppDispatch = typeof import('./store').default['dispatch'];


