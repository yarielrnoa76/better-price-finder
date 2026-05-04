import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, History, Settings, Zap } from 'lucide-react';

const navItems = [
  { to: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products',  icon: Package },
  { to: '/history',  label: 'History',   icon: History },
  { to: '/settings', label: 'Settings',  icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
        <Zap className="h-6 w-6 text-blue-400" />
        <span className="font-bold text-base leading-tight">Better Price<br/>Finder</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">Powered by n8n + SerpAPI</p>
      </div>
    </aside>
  );
}
