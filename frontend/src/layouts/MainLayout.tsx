import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PawPrint, Bell, Network, CheckSquare, BrainCircuit } from 'lucide-react';
import clsx from 'clsx';

export const MainLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/animals', label: 'Animals', icon: PawPrint },
    { path: '/alerts', label: 'Risk Alerts', icon: Bell },
    { path: '/herd', label: 'Herd Intelligence', icon: Network },
    { path: '/verification', label: 'Verification', icon: CheckSquare },
    { path: '/model', label: 'Model Intelligence', icon: BrainCircuit },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary tracking-tight">MUNNOKKU</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">Predict Before. Prevent Earlier.</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary-50 text-primary-dark" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={clsx("mr-3 h-5 w-5", isActive ? "text-primary" : "text-gray-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 m-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs font-semibold text-amber-800 text-center uppercase tracking-wider">Prototype • Synthetic Data</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
