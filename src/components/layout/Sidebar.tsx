import { ViewType } from '../../types';
import { 
  LayoutDashboard, 
  Upload, 
  Dna, 
  BarChart3, 
  Globe, 
  FileText, 
  User,
  X,
  Compass
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { Tooltip } from '../shared/Tooltip';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
  sampleCount: number;
}

export default function Sidebar({
  activeView,
  setActiveView,
  isOpen,
  onClose,
  sampleCount
}: SidebarProps) {
  const { user, isDemoMode, exitDemoMode, showToast } = useAppStore();
  
  // Navigation items mapping
  const menuItems = [
    { id: 'home' as ViewType, label: 'Dashboard', icon: LayoutDashboard, tooltip: 'Overview of your project statistics and dataset summaries' },
    { id: 'upload' as ViewType, label: 'Upload', icon: Upload, tooltip: 'Upload FASTA, AB1, or SEQ files to start analysis' },
    { id: 'sequences' as ViewType, label: 'Sequences', icon: Dna, badge: sampleCount > 0 ? sampleCount : undefined, tooltip: 'View and manage your loaded sequences' },
    { id: 'analysis' as ViewType, label: 'Analysis', icon: BarChart3, tooltip: 'Run MSA, calculate diversity (Hd/π), and build phylogenetic trees' },
    { id: 'ncbi' as ViewType, label: 'NCBI Tools', icon: Globe, tooltip: 'Search NCBI database or fetch reference sequences by accession' },
    { id: 'report' as ViewType, label: 'Reports', icon: FileText, tooltip: 'Generate AI-powered biological insights from your analysis' },
    { id: 'settings' as ViewType, label: 'Profile', icon: User, tooltip: 'Configure API keys and credentials' },
  ];

  const handleNavClick = (view: ViewType) => {
    setActiveView(view);
    onClose(); // Close mobile drawer when clicked
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-teal-950/40 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-[260px] z-50 md:z-30 flex flex-col justify-between border-r transition-colors transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-teal-50 dark:bg-teal-900 border-slate-200 dark:border-teal-800 text-teal-950 dark:text-teal-50`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-teal-850 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-md bg-teal-500 text-white shadow-xs">
                <Compass className="w-5 h-5 animate-spin-slow" />
              </div>
              <span className="font-sans font-bold text-sm tracking-tight leading-4 block max-w-[150px]">
                The Student Genomics Suite
              </span>
            </div>
            
            {/* Close button on mobile */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-teal-850 md:hidden border border-slate-250 dark:border-teal-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-teal-900 dark:text-teal-100" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-teal-700/80 dark:text-teal-300/80 animate-pulse">
              Research Modules
            </div>
            
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-teal-500 text-white shadow-sm font-bold scale-[1.01]'
                      : 'text-teal-900 dark:text-teal-150 hover:bg-teal-100/60 dark:hover:bg-teal-805 hover:translate-x-0.5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110' : ''}`} />
                    <Tooltip text={item.tooltip}>
                      <span>{item.label}</span>
                    </Tooltip>
                  </div>
                  
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                      isActive 
                        ? 'bg-white text-teal-600' 
                        : 'bg-teal-200/80 dark:bg-teal-800 text-teal-950 dark:text-teal-100'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-teal-800/60 bg-slate-50 dark:bg-teal-950/25">
          {/* If demo mode, show Exit CTA */}
          {isDemoMode && (
            <button
              onClick={() => {
                exitDemoMode();
                showToast('Welcome to your workspace. Upload your own data to begin.', 'success');
              }}
              className="w-full mb-3 px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900 border border-amber-200 dark:border-amber-900 rounded-lg text-[10px] font-bold text-amber-800 dark:text-amber-300 transition-all inline-flex items-center justify-center space-x-1.5 uppercase tracking-wider cursor-pointer"
            >
              <span>Exit Demo → Start Workspace</span>
            </button>
          )}

          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-teal-800/40 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold font-sans text-xs shrink-0 select-none uppercase">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-teal-950 dark:text-teal-50 truncate leading-3 mb-1">
                  {user?.name || 'Guest User'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-300 truncate leading-3 font-medium">
                  {user?.email || 'local-session@browser'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
