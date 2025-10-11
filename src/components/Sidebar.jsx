import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, FileText, CheckSquare, Folder, Shield, Settings, Video } from 'lucide-react';

const sidebarItems = [
  { name: 'Home', icon: Home, path: '/' },
  { name: 'General Tools', icon: Wrench, path: '/category/general' },
  { name: 'Media Tools', icon: Video, path: '/category/media' },
  { name: 'PDF & Image Tools', icon: FileText, path: '/category/pdf' },
  { name: 'Productivity', icon: CheckSquare, path: '/category/productivity' },
  { name: 'File & System', icon: Folder, path: '/category/file' },
  { name: 'Security', icon: Shield, path: '/category/security' },
];

const bottomItems = [
  { name: 'Settings', icon: Settings, path: '/settings' },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-zinc-800 shadow-lg flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Múra-2ools</h1>
      </div>
      <nav className="px-4 flex-1">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <nav className="px-4 pb-4 border-t border-zinc-200 dark:border-zinc-700 pt-4">
        <ul className="space-y-2">
          {bottomItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;