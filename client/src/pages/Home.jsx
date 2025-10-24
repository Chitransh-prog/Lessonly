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
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="flex items-center mb-8">
                <img 
                    src="Logo.png" 
                    alt="Lessonly Logo" 
                    className="h-16 w-16 md:h-20 md:w-20"/>
                <h1 className="font-black text-5xl md:text-6xl ps-4 text-gray-900">Lessonly</h1>
            </div>
            
            <div className="animate-fadeIn mt-4">
                <button 
                    onClick={handleButtonClick}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-3 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold px-8 py-4 border border-black rounded-3xl transition-all duration-200 hover:scale-105 disabled:scale-100 text-lg"
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </span>
                    ) : (
                        <>
                            Get Started
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}