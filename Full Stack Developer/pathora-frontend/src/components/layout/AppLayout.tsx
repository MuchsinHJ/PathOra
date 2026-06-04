import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import FooterLayout from "./FooterLayout";

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex-1 lg:ml-64 flex flex-col">
                <Navbar
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto bg-[#F4F9F4]">
                    <div className="p-4 md:p-6 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                <FooterLayout />
            </div>
        </div>
    );
};

export default AppLayout;