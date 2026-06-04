import React from "react";
import FooterLayout from "./FooterLayout";

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col bg-[#F4F9F4]">
            <header className="w-full bg-[#F4F9F4] py-4 shadow-md">
                <h1 className="text-center text-3xl font-bold font-['Newsreader'] text-gray-900">
                    Path`Ora
                </h1>
            </header>

            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="max-w-sm w-full bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold font-['Newsreader',_serif] text-gray-900">
                            {title}
                        </h1>
                        <p className="text-xs text-gray-600 mt-2">
                            {subtitle}
                        </p>
                    </div>

                    {children}
                </div>
            </div>
                <FooterLayout />
        </div>
    );
};

export default AuthLayout;
