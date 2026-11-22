import React, { createContext, useContext, useState } from 'react';

interface TabBarContextType {
  isTabBarHidden: boolean;
  setTabBarHidden: (hidden: boolean) => void;
}

const TabBarContext = createContext<TabBarContextType>({
  isTabBarHidden: false,
  setTabBarHidden: () => {},
});

export const TabBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTabBarHidden, setTabBarHidden] = useState(false);
  return (
    <TabBarContext.Provider value={{ isTabBarHidden, setTabBarHidden }}>
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBar = () => useContext(TabBarContext);
