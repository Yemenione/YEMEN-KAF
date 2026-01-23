"use client";

import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
    isSidebarOpen: boolean;
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
    toggleSidebarCollapse: () => void;
    closeSidebar: () => void;
    openSidebar: () => void;
}

const UIContext = createContext<UIContextType>({
    isSidebarOpen: false,
    isSidebarCollapsed: false,
    toggleSidebar: () => { },
    toggleSidebarCollapse: () => { },
    closeSidebar: () => { },
    openSidebar: () => { }
});

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => setSidebarOpen(prev => !prev);
    const toggleSidebarCollapse = () => setSidebarCollapsed(prev => !prev);
    const closeSidebar = () => setSidebarOpen(false);
    const openSidebar = () => setSidebarOpen(true);

    return (
        <UIContext.Provider value={{
            isSidebarOpen,
            isSidebarCollapsed,
            toggleSidebar,
            toggleSidebarCollapse,
            closeSidebar,
            openSidebar
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => useContext(UIContext);
