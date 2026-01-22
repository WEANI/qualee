'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  ChevronDown,
  Check,
  Building2,
  Plus
} from 'lucide-react';
import { Organization, Store as StoreType } from '@/lib/types/database';

interface StoreSwitcherProps {
  onStoreChange?: (store: StoreType | null, organization: Organization | null) => void;
}

interface OrganizationWithStores extends Organization {
  stores?: StoreType[];
}

export function StoreSwitcher({ onStoreChange }: StoreSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationWithStores[]>([]);
  const [currentOrg, setCurrentOrg] = useState<OrganizationWithStores | null>(null);
  const [currentStore, setCurrentStore] = useState<StoreType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgsData } = await supabase
        .from('organizations')
        .select(`
          *,
          stores (*)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      setOrganizations(orgsData || []);

      // Auto-select first org and store if available
      if (orgsData && orgsData.length > 0) {
        const firstOrg = orgsData[0];
        setCurrentOrg(firstOrg);

        // Try to get from localStorage
        const savedStoreId = localStorage.getItem('currentStoreId');
        const savedOrgId = localStorage.getItem('currentOrgId');

        if (savedOrgId && savedStoreId) {
          const savedOrg = orgsData.find(o => o.id === savedOrgId);
          if (savedOrg) {
            setCurrentOrg(savedOrg);
            const savedStore = savedOrg.stores?.find(s => s.id === savedStoreId);
            if (savedStore) {
              setCurrentStore(savedStore);
              onStoreChange?.(savedStore, savedOrg);
            }
          }
        } else if (firstOrg.stores && firstOrg.stores.length > 0) {
          const hq = firstOrg.stores.find(s => s.is_headquarters) || firstOrg.stores[0];
          setCurrentStore(hq);
          onStoreChange?.(hq, firstOrg);
        }
      }
    } catch (err) {
      console.error('Error loading organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectStore = (store: StoreType, org: OrganizationWithStores) => {
    setCurrentStore(store);
    setCurrentOrg(org);
    setIsOpen(false);

    // Save to localStorage
    localStorage.setItem('currentStoreId', store.id);
    localStorage.setItem('currentOrgId', org.id);

    onStoreChange?.(store, org);
  };

  if (loading) {
    return (
      <div className="h-10 w-48 bg-slate-800/50 rounded-lg animate-pulse" />
    );
  }

  // Don't show if no organizations
  if (organizations.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-white px-3 py-2 h-auto"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: currentOrg?.primary_color + '30' || '#7209B730' }}
        >
          <Store className="w-4 h-4" style={{ color: currentOrg?.primary_color || '#7209B7' }} />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs text-slate-400 leading-none">Magasin actif</p>
          <p className="text-sm font-medium text-white leading-tight">
            {currentStore?.name || 'Selectionner'}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-slate-700/50">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Vos magasins
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {organizations.map((org) => (
                <div key={org.id}>
                  {/* Organization Header */}
                  <div className="px-3 py-2 bg-slate-800/50 flex items-center gap-2">
                    <Building2 className="w-4 h-4" style={{ color: org.primary_color }} />
                    <span className="text-sm font-medium text-white">{org.name}</span>
                    <Badge className="ml-auto text-xs bg-slate-700 text-slate-300">
                      {org.stores?.length || 0}
                    </Badge>
                  </div>

                  {/* Stores List */}
                  {org.stores?.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => selectStore(store, org)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800/50 transition-colors ${
                        currentStore?.id === store.id ? 'bg-slate-800' : ''
                      }`}
                    >
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                        <Store className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-white">{store.name}</p>
                        <p className="text-xs text-slate-500">
                          {store.city || 'Adresse non definie'}
                        </p>
                      </div>
                      {store.is_headquarters && (
                        <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                          Siege
                        </Badge>
                      )}
                      {currentStore?.id === store.id && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </button>
                  ))}

                  {(!org.stores || org.stores.length === 0) && (
                    <p className="px-4 py-3 text-sm text-slate-500 italic">
                      Aucun magasin
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-700/50">
              <a
                href="/dashboard/multistore"
                className="flex items-center justify-center gap-2 w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                Gerer les magasins
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
