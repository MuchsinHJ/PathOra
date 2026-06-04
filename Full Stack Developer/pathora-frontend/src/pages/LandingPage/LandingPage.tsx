import { Link } from "react-router-dom";

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900" >
            <header className="w-full max-w-4xl flex justify-end p-4 bg-purple-600 border-b border-purple-700">
                <nav className="w-full flex justify-end p-4">
                    <Link to="/login" className="text-sm text-white hover:text-purple-200 transition mr-4">
                        Login
                    </Link>
                    <Link to="/register" className="text-sm text-white hover:text-purple-200 transition">
                        Register
                    </Link>
                    
                    <Link to="/dashboard" className="text-sm text-white hover:text-purple-200 transition">
                        Dashboard
                    </Link>
                </nav>
            </header>
            <div className="max-w-md text-center">
                <h1 className="text-4xl font-bold mb-4 text-blue-600">Path`Ora</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Platform End-to-End Kesiapan Kerja dengan Dashboard Strategis & Rekomendasi Jalur Karir Otomatis.
                </p>
                
            </div>
        </div>
    );
}