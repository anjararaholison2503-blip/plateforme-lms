import { createContext, useContext } from 'react';

const LayoutContext = createContext({
  onMenuClick: () => {},
});

export const LayoutProvider = LayoutContext.Provider;
export const useLayout = () => useContext(LayoutContext);