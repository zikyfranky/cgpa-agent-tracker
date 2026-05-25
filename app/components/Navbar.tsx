'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calculator, 
  GraduationCap, 
  Settings,
  Calendar as CalendarIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Knowledge Atlas', href: '/knowledge-base', icon: BookOpen },
    { name: 'Simulator', href: '/calculator', icon: Calculator },
    { name: 'Timetable', href: '/timetable', icon: CalendarIcon },
    { name: 'Courses', href: '/courses', icon: GraduationCap },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                CGPA <span className="text-blue-500">Agent</span>
              </span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors",
                      isActive 
                        ? "border-blue-500 text-white" 
                        : "border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-blue-900/30 px-3 py-1 rounded-full border border-blue-800/50">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">300L SEM 2</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-300">IF</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
