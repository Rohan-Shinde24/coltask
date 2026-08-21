'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Settings, LogOut, Shield } from 'lucide-react';
import axios from 'axios';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Do not render the sidebar if we are on the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await axios.post('/api/admin/auth/logout');
      router.push('/admin/login');
    } catch (err) {
      console.error('Failed to logout', err);
    }
  };

  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, href: '/admin' },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-base-200 flex">
      {/* Sidebar */}
      <div className="w-64 bg-base-100 border-r border-base-300 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-base-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Admin</h1>
              <p className="text-xs text-base-content/50">ColTask Portal</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <div className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-3 ml-2">Menu</div>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-primary text-primary-content shadow-sm' 
                    : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-base-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-error hover:bg-error/10"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile Header (visible only on small screens) */}
        <div className="md:hidden bg-base-100 border-b border-base-300 p-4 flex justify-between items-center sticky top-0 z-50">
           <div className="flex items-center gap-2">
            <Shield className="text-primary" size={24} />
            <h1 className="font-bold">Admin Portal</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-sm btn-ghost text-error">
            <LogOut size={16} />
          </button>
        </div>

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
