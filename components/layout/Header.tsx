import React from 'react';
import { Menu } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const Header: React.FC = () => {
    const { toggleMobileSidebar } = useSidebar();
    return (
        <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-sm border-b border-slate-200 z-20 h-16 flex items-center px-4">
            <button
                onClick={toggleMobileSidebar}
                className="p-2 text-slate-600 hover:bg-slate-200 rounded-md"
                aria-label="Ouvrir le menu"
            >
                <Menu size={24} />
            </button>
             <div className="flex items-center gap-2 ml-4">
                <h1 className="text-lg font-bold text-slate-800">ISO Manager</h1>
            </div>
        </header>
    );
};

export default Header;