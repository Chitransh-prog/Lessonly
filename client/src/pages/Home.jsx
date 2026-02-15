import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Home() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleButtonClick = () => {
        setIsLoading(true);
        
        setTimeout(() => {
            navigate('/signin');
        }, 300);
    };

    return (
        <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-900 relative overflow-hidden flex flex-col items-center justify-center">
            
            {/* Background Ambience */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center animate-fadeIn">
                
                {/* Logo Section */}
                <div className="flex items-center gap-5 mb-14">
                    <img 
                        src="Logo.png" 
                        alt="Lessonly Logo" 
                        className="h-20 w-20 md:h-24 md:w-24 drop-shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-transform hover:scale-110 duration-500"
                    />
                    <h1 className="font-black text-6xl md:text-7xl text-white tracking-tight drop-shadow-lg">
                        Lessonly
                    </h1>
                </div>
                
                {/* Main Action Button */}
                <button 
                    onClick={handleButtonClick}
                    disabled={isLoading}
                    className="
                        group relative flex items-center justify-center gap-3 
                        bg-cyan-400 text-slate-900 
                        font-black text-xl px-10 py-5 rounded-full 
                        shadow-[0_0_20px_rgba(34,211,238,0.4)] 
                        hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] 
                        hover:bg-cyan-300 hover:scale-105 hover:-translate-y-1
                        active:scale-95 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed
                        transition-all duration-300
                    "
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </span>
                    ) : (
                        <>
                            Get Started
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" 
                                className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}