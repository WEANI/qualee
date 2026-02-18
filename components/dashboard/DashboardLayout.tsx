'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { NotificationDropdown } from '@/components/dashboard/NotificationDropdown';
// import { StoreSwitcher } from '@/components/dashboard/StoreSwitcher'; // Multi-store - masque pour l'instant
import {
  LayoutDashboard,
  Gift,
  QrCode,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Users,
  CreditCard,
  Target,
  ScanLine,
  ChevronRight,
  Store,
  Award,
  Send,
  Building2,
  UserCircle,
  CircleUserRound
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  merchant?: any;
}

export function DashboardLayout({ children, merchant }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navigationSections = [
    {
      label: 'PRINCIPAL',
      items: [
        { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'OPERATIONS',
      items: [
        { name: 'Scanner', href: '/dashboard/scan', icon: ScanLine },
        { name: 'QR Code', href: '/dashboard/qr', icon: QrCode },
      ],
    },
    {
      label: 'ENGAGEMENT',
      items: [
        { name: 'Lots & Prix', href: '/dashboard/prizes', icon: Gift },
        { name: 'Programme fidelite', href: '/dashboard/loyalty', icon: Award },
        { name: 'Strategie', href: '/dashboard/strategy', icon: Target },
        { name: 'Avis clients', href: '/dashboard/feedback', icon: MessageSquare },
        { name: 'Campagne WhatsApp', href: '/dashboard/marketing/whatsapp-campaign', icon: Send },
      ],
    },
    {
      label: 'ANALYTICS',
      items: [
        { name: 'Statistiques', href: '/dashboard/analytics', icon: BarChart3 },
        { name: 'Clients', href: '/dashboard/customers', icon: Users },
      ],
    },
    {
      label: 'MON COMPTE',
      items: [
        { name: 'Mon Profil', href: '/dashboard/profile', icon: UserCircle },
        { name: 'Mon Compte', href: '/dashboard/account', icon: CircleUserRound },
        { name: 'Abonnement', href: '/dashboard/billing', icon: CreditCard },
        { name: 'Parametres', href: '/dashboard/settings', icon: Settings },
      ],
    },
  ];

  // Flat list for top bar title lookup
  const allNavItems = navigationSections.flatMap(s => s.items);

  // Multi-store navigation - masque pour l'instant
  // const multiStoreNavigation = [
  //   { name: 'Multi-Magasins', href: '/dashboard/multistore', icon: Building2 },
  //   { name: 'Scan Cross-Store', href: '/dashboard/multistore/scan', icon: ScanLine },
  // ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-[#0F172A] border-r border-slate-800/50 transform transition-transform duration-300 ease-in-out shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/50 bg-[#0F172A]">
            <Link href="/dashboard" className="flex items-center gap-3">
              <img
                src="/Logo Qualee pink violet.png"
                alt="Qualee Logo"
                className="h-8 w-auto transition-transform hover:scale-105"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Merchant Info */}
          {merchant && (
            <div className="px-6 py-5 border-b border-slate-800/50 bg-[#0F172A]/50">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/20">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {merchant.business_name || merchant.name}
                  </p>
                  <p className="text-xs text-slate-400 capitalize flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                    Plan {merchant.subscription_tier || 'Gratuit'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            {navigationSections.map((section, sectionIdx) => (
              <div key={section.label}>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 px-4 mb-2 ${sectionIdx === 0 ? 'mt-2' : 'mt-4'}`}>
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                          ${isActive
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/20 border border-violet-500/20'
                            : 'text-white hover:bg-slate-800/50'
                          }
                        `}
                      >
                        <Icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                        {item.name}
                        {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white/50" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Multi-Store Section - masque pour l'instant */}
            {/*
            <div className="my-6 px-4">
              <div className="border-t border-slate-700/50"></div>
            </div>
            <div className="flex items-center gap-2 px-4 mb-4">
              <Building2 className="w-4 h-4 text-[#F97316]" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Multi-Store</p>
            </div>
            {multiStoreNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-lg shadow-orange-900/20 border border-orange-500/20'
                      : 'text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  <Icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  {item.name}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white/50" />}
                </Link>
              );
            })}
            */}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-slate-800/50 bg-[#0F172A]">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Se deconnecter
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
          <div className="flex items-center justify-between h-20 px-4 sm:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-900">
                  {allNavItems.find(item =>
                    item.href === pathname || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
                  )?.name || 'Tableau de bord'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* <StoreSwitcher /> Multi-store - masque pour l'instant */}
              {merchant && <NotificationDropdown merchantId={merchant.id} />}
              <button
                onClick={handleSignOut}
                className="p-2.5 rounded-full hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
                title="Se deconnecter"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
