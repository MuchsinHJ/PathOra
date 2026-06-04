import React from "react";

const FooterLayout: React.FC = () => {
    return (
        <footer className="
            bg-[#F4F9F4]
            border-t border-gray-200
            px-4 py-3 md:px-6 md:py-6
            shadow-[0_-2px_6px_rgba(0,0,0,0.05)]
        ">
            <div className="
                max-w-7xl mx-auto
                flex items-center justify-center md:justify-between
                text-xs text-gray-600
            ">
                
                {/* Copyright */}
                <p className="text-center">
                    &copy; {new Date().getFullYear()} Path'Ora. All rights reserved.
                </p>

                {/* Links - hanya tampil di md ke atas */}
                <div className="hidden md:flex gap-6">
                    <a href="#" className="hover:text-gray-900 transition-colors">
                        Privacy Policy
                    </a>
                    <a href="#" className="hover:text-gray-900 transition-colors">
                        Terms of Service
                    </a>
                    <a href="#" className="hover:text-gray-900 transition-colors">
                        Support
                    </a>
                </div>

            </div>
        </footer>
    );
};

export default FooterLayout;