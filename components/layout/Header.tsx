import React from 'react';
import { Menu } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
    const { toggleMobileSidebar } = useSidebar();
    return (
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-slate-200 z-20 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleMobileSidebar}
                    className="p-2 -ml-2 text-slate-600 hover:bg-slate-200 rounded-md md:hidden"
                    aria-label="Ouvrir le menu"
                >
                    <Menu size={24} />
                </button>
                 <div className="flex items-center gap-2 md:hidden">
                    <h1 className="text-lg font-bold text-slate-800">ISO Manager</h1>
                </div>
            </div>
            
            <div className="flex items-center">
                <NotificationBell />
            </div>
        </header>
    );
};

export default Header;