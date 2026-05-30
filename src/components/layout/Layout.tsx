import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { ViewType } from '../../types';

interface LayoutProps {
  children: ReactNode;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  sampleCount: number;
}

export default function Layout({
  children,
  activeView,
  setActiveView,
  sampleCount
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex overflow-hidden text-teal-900 dark:text-teal-50">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sampleCount={sampleCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-[260px] min-h-screen overflow-x-hidden">
        {/* Header toolbar */}
        <Header onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
        
        {/* Scrollable Container */}
        <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
          <div className="max-w-7xl mx-auto w-full pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
