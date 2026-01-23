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
  Megaphone,
  Send,
  Building2,
  UserCircle
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

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Scanner', href: '/dashboard/scan', icon: ScanLine },
    { name: 'Lots', href: '/dashboard/prizes', icon: Gift },
    { name: 'Avis', href: '/dashboard/feedback', icon: MessageSquare },
    { name: 'QR Code', href: '/dashboard/qr', icon: QrCode },
    { name: 'Statistiques', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Strategie', href: '/dashboard/strategy', icon: Target },
    { name: 'Clients', href: '/dashboard/customers', icon: Users },
    { name: 'Facturation', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Mon Profil', href: '/dashboard/profile', icon: UserCircle },
    { name: 'Parametres', href: '/dashboard/settings', icon: Settings },
  ];

  const loyaltyNavigation = [
    { name: 'Programme fidelite', href: '/dashboard/loyalty', icon: Award },
  ];

  const marketingNavigation = [
    { name: 'Campagne WhatsApp', href: '/dashboard/marketing/whatsapp-campaign', icon: Send },
  ];

  // Multi-store navigation - masque pour l'instant
  // const multiStoreNavigation = [
  //   { name: 'Multi-Magasins', href: '/dashboard/multistore', icon: Building2 },
  //   { name: 'Scan Cross-Store', href: '/dashboard/multistore/scan', icon: ScanLine },
  // ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/20 relative">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Decorative gradient orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

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
            <div className="px-6 py-6 border-b border-slate-800/50 bg-[#0F172A]/50">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="w-10 h-10 bg-gradient-to-br from-[#7209B7] to-[#3A0CA3] rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/20">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {merchant.business_name || merchant.name}
                  </p>
                  <p className="text-xs text-slate-400 capitalize flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EB1E99] animate-pulse"></span>
                    Plan {merchant.subscription_tier || 'Gratuit'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu principal</p>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-[#7209B7] to-[#3A0CA3] text-white shadow-lg shadow-violet-900/20 border border-violet-500/20'
                      : 'text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  {item.name}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white/50" />}
                </Link>
              );
            })}

            {/* Loyalty Section Separator */}
            <div className="my-6 px-4">
              <div className="border-t border-slate-700/50"></div>
            </div>

            {/* Loyalty Section */}
            <div className="flex items-center gap-2 px-4 mb-4">
              <Award className="w-4 h-4 text-[#00A7E1]" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fidelite</p>
            </div>
            {loyaltyNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-[#00A7E1] to-[#0090C1] text-white shadow-lg shadow-sky-900/20 border border-sky-500/20'
                      : 'text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  {item.name}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white/50" />}
                </Link>
              );
            })}

            {/* Marketing Section Separator */}
            <div className="my-6 px-4">
              <div className="border-t border-slate-700/50"></div>
            </div>

            {/* Marketing Section */}
            <div className="flex items-center gap-2 px-4 mb-4">
              <Megaphone className="w-4 h-4 text-[#EB1E99]" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Marketing</p>
            </div>
            {marketingNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-[#EB1E99] to-[#C01682] text-white shadow-lg shadow-pink-900/20 border border-pink-500/20'
                      : 'text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  {item.name}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white/50" />}
                </Link>
              );
            })}

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
                    group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-lg shadow-orange-900/20 border border-orange-500/20'
                      : 'text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
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
                  {navigation.find(item => item.href === pathname)?.name ||
                   loyaltyNavigation.find(item => pathname.startsWith(item.href))?.name ||
                   marketingNavigation.find(item => pathname.startsWith(item.href))?.name ||
                   'Tableau de bord'}
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  En ligne
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* <StoreSwitcher /> Multi-store - masque pour l'instant */}
              <div className="h-9 px-4 rounded-full bg-violet-50 text-violet-700 border border-violet-100 flex items-center gap-2 text-sm font-medium hidden sm:flex">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EB1E99] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EB1E99]"></span>
                </span>
                En ligne
              </div>
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
