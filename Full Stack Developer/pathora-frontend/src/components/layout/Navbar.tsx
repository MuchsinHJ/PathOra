import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../store/auth.store.ts";
import { Moon, Sun, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { userService } from "../../services/user.service.ts";

interface NavbarProps {
    onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
    onMenuClick,
}) => {
    const { user, token, setUser } = useAuthStore();
    const [isProfileLoading, setProfileLoading] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        const storedTheme = localStorage.getItem("pathora-theme");
        return storedTheme === "dark" ? "dark" : "light";
    });
    const profileRequestId = useRef(0);

    useEffect(() => {
        const root = document.documentElement;

        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        localStorage.setItem("pathora-theme", theme);
    }, [theme]);

    useEffect(() => {
        if (!token) {
            setProfileLoading(false);
            return;
        }

        if (user) {
            setProfileLoading(false);
            return;
        }

        const requestId = profileRequestId.current + 1;
        profileRequestId.current = requestId;
        setProfileLoading(true);

        userService
            .getProfile()
            .then((profile) => {
                if (profileRequestId.current === requestId) {
                    setUser(profile);
                }
            })
            .catch(() => undefined)
            .finally(() => {
                if (profileRequestId.current === requestId) {
                    setProfileLoading(false);
                }
            });
    }, [token, user, setUser]);

    const displayName = isProfileLoading ? "Memuat..." : user?.name || "User";
    const displayEmail = isProfileLoading
        ? "Mengambil profil..."
        : user?.email || "email@example.com";

    const toggleTheme = () => {
        setTheme((current) => (current === "dark" ? "light" : "dark"));
    };

    return (
        <nav className="h-16 bg-[#F4F9F4] border-b shadow flex items-center px-4 md:px-6 z-30">

            {/* Burger Menu */}
            <button
                onClick={onMenuClick}
                className="lg:hidden  p-2 rounded-lg hover:bg-gray-100"
            >
                <Menu size={22} />
            </button>

            <div className="flex items-center gap-4 ml-auto">
                
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    aria-label={
                        theme === "dark"
                            ? "Aktifkan tema terang"
                            : "Aktifkan tema gelap"
                    }
                    title={
                        theme === "dark"
                            ? "Aktifkan tema terang"
                            : "Aktifkan tema gelap"
                    }
                >
                    {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                <div className="flex items-center gap-3 pl-4 ">
                    <div className="hidden sm:flex flex-col items-end">
                        <p className="text-sm font-medium hidden md:flex">
                            {displayName}
                        </p>

                        <p className="text-xs text-gray-500 hidden md:flex">
                            {displayEmail}
                        </p>
                    </div>

                    <Link to="/profile">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-105 transition">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
