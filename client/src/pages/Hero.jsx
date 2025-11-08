import React, { useEffect, useState } from 'react';
import TextType from '../animations/TextType';
import { supabase } from '../lib/supabase'; 

export default function Hero() {
    // 1. State to hold the user's name
    const [userName, setUserName] = useState("Educator");

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                // Get the current session
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user) {
                    const userMetadata = session.user.user_metadata;
                    
                    // 2. Extract the name, prioritizing 'full_name' or 'name' from Google data
                    const name = userMetadata?.full_name || userMetadata?.name || "Educator";
                    setUserName(name);
                }
            } catch (error) {
                console.error("Error fetching user name:", error);
            }
        };

        fetchUserName();
        
        // Optional: Listen for auth changes to update the name in real-time
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const userMetadata = session.user.user_metadata;
                const name = userMetadata?.full_name || userMetadata?.name || "Educator";
                setUserName(name);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);


    return(
        <>
        <div className="h-screen flex flex-col items-center justify-center ">
            <img src='Logo.png' alt="Lessonly Logo"/>
            
            {/* Display the typing animation first */}
            <TextType className='text-6xl font-black'
                text={["Welcome to Lessonly!","Welcome to Lessonly!"]}
                typingSpeed={200}
                pauseDuration={1500}
                showCursor={true}
                cursorCharacter="|"
            />
            
            <h1 className="text-2xl font-semibold mt-4 text-gray-700">
                Hello, {userName}. Let's create something brilliant.
            </h1>
        </div>
        </>
    )
}