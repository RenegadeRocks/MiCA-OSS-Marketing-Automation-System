import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 py-8">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
                <div className="flex items-center space-x-1 mb-4 md:mb-0">
                    <span>Built with</span>
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                    <span>for social heroes and small business owners</span>
                </div>

                <div className="flex space-x-6">
                    <a href="#" className="hover:text-white transition-colors">About</a>
                    <a href="#" className="hover:text-white transition-colors">Contact</a>
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                </div>
            </div>
        </footer>
    );
};
