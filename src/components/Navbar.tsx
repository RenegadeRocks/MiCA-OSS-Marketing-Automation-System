import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import MiCALogo from './MiCALogo';

export const Navbar: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Hide the Settings (API keys) entry point in demo mode — on the public
    // demo deployment the user can't usefully paste keys; the gear icon is
    // confusing. Local self-hosters with demo mode off still see it.
    const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('mica_demo_mode') === 'true';

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-10">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <MiCALogo variant="header" static />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {!isDemoMode && (
                            <Link to="/settings" aria-label="Settings">
                                <Button variant="ghost" size="sm" className="text-gray-300">
                                    <SettingsIcon className="w-4 h-4" />
                                </Button>
                            </Link>
                        )}
                        {user ? (
                            <>
                                <div className="flex items-center space-x-2 text-gray-300 mr-4">
                                    <User className="w-4 h-4" />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleSignOut} leftIcon={<LogOut className="w-4 h-4" />}>
                                    Log Out
                                </Button>
                                <Link to="/campaigns">
                                    <Button variant="ghost" size="sm" className="text-gray-300">My Campaigns</Button>
                                </Link>
                                <Link to="/create-campaign">
                                    <Button variant="primary" size="sm">New Campaign</Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Log In</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button variant="primary" size="sm">Sign Up</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-300 hover:text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-4 space-y-4">
                    {user ? (
                        <>
                            <div className="text-gray-300 text-sm px-2 mb-2">{user.email}</div>
                            <Link to="/campaigns" onClick={() => setIsMenuOpen(false)} className="block">
                                <Button variant="ghost" className="w-full justify-start text-gray-300">My Campaigns</Button>
                            </Link>
                            <Link to="/create-campaign" onClick={() => setIsMenuOpen(false)} className="block">
                                <Button variant="primary" className="w-full">New Campaign</Button>
                            </Link>
                            {!isDemoMode && (
                                <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="block">
                                    <Button variant="ghost" className="w-full justify-start text-gray-300">
                                        <SettingsIcon className="w-4 h-4 mr-2" /> Settings
                                    </Button>
                                </Link>
                            )}
                            <Button variant="ghost" className="w-full justify-start" onClick={() => { handleSignOut(); setIsMenuOpen(false); }}>
                                <LogOut className="w-4 h-4 mr-2" /> Log Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block">
                                <Button variant="ghost" className="w-full justify-center">Log In</Button>
                            </Link>
                            <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="block">
                                <Button variant="primary" className="w-full justify-center">Sign Up</Button>
                            </Link>
                            {!isDemoMode && (
                                <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="block">
                                    <Button variant="ghost" className="w-full justify-center">
                                        <SettingsIcon className="w-4 h-4 mr-2" /> Settings
                                    </Button>
                                </Link>
                            )}
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};
