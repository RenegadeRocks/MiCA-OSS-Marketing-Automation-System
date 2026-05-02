import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col text-white font-sans relative">
            <div className="bg-smoke-layer" />
            <Navbar />
            <main className="flex-grow pt-11 relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
};
