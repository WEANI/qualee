'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Store,
  Building2,
  Gift,
  AlertTriangle,
  ChevronDown,
  Check
} from 'lucide-react';
import { Organization, Store as StoreType } from '@/lib/types/database';

interface OrganizationWithStores extends Organization {
  stores?: StoreType[];
}

interface CouponValidation {
  valid: boolean;
  message?: string;
  error?: string;
  reason?: string;
  coupon?: {
    id: string;
    code: string;
    prize_name: string;
    prize_image?: string;
    expires_at: string;
    won_at_store_id?: string;
    is_cross_store: boolean;
  };
}

type ScanStatus = 'idle' | 'selecting-store' | 'scanning' | 'verifying' | 'valid' | 'invalid' | 'redeemed';

export default function CrossStoreScanPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [organizations, setOrganizations] = useState<OrganizationWithStores[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationWithStores | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);

  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [validation, setValidation] = useState<CouponValidation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    checkAuth();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (selectedStore && scanStatus === 'scanning') {
      initScanner();
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [selectedStore, scanStatus]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUser(user);

    const { data: merchantData } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    setMerchant(merchantData);

    // Load organizations
    const { data: orgsData } = await supabase
      .from('organizations')
      .select(`*, stores (*)`)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    setOrganizations(orgsData || []);

    // Auto-select from localStorage
    const savedStoreId = localStorage.getItem('currentStoreId');
    const savedOrgId = localStorage.getItem('currentOrgId');

    if (orgsData && orgsData.length > 0) {
      if (savedOrgId && savedStoreId) {
        const org = orgsData.find(o => o.id === savedOrgId);
        if (org) {
          setSelectedOrg(org);
          const store = org.stores?.find((s: StoreType) => s.id === savedStoreId);
          if (store) setSelectedStore(store);
        }
      } else {
        // Auto-select first org and store
        const firstOrg = orgsData[0];
        setSelectedOrg(firstOrg);
        if (firstOrg.stores && firstOrg.stores.length > 0) {
          const hq = firstOrg.stores.find((s: StoreType) => s.is_headquarters) || firstOrg.stores[0];
          setSelectedStore(hq);
        }
      }
    }
  };

  const initScanner = () => {
    const scanner = new Html5QrcodeScanner(
      "cross-store-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true
      },
      false
    );
    scanner.render(onScanSuccess, () => {});
    scannerRef.current = scanner;
  };

  const startScanning = () => {
    if (!selectedStore) {
      setScanStatus('selecting-store');
      return;
    }
    setScanStatus('scanning');
    setValidation(null);
    setErrorMessage(null);
    setManualCode('');
  };

  const onScanSuccess = async (decodedText: string) => {
    if (scannerRef.current) {
      await scannerRef.current.clear();
      scannerRef.current = null;
    }
    verifyCode(decodedText);
  };

  const verifyCode = async (codeData: string) => {
    if (!selectedStore) return;

    setScanStatus('verifying');
    setErrorMessage(null);

    // Extract code from URL or use raw
    let codeToVerify = codeData;
    try {
      if (codeData.includes('code=')) {
        const urlObj = new URL(codeData);
        const codeParam = urlObj.searchParams.get('code');
        if (codeParam) codeToVerify = codeParam;
      }
    } catch {
      // Not a URL
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setScanStatus('invalid');
        setErrorMessage('Session expiree. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch('/api/stores/scan-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          coupon_code: codeToVerify,
          store_id: selectedStore.id
        })
      });

      const result: CouponValidation = await response.json();

      setValidation(result);

      if (result.valid) {
        setScanStatus('valid');
      } else {
        setScanStatus('invalid');
        setErrorMessage(result.error || 'Code invalide');
      }
    } catch (err: any) {
      setScanStatus('invalid');
      setErrorMessage(err.message || 'Erreur lors de la verification');
    }
  };

  const redeemCoupon = async () => {
    if (!validation?.coupon || !selectedStore) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMessage('Session expiree.');
        return;
      }

      const response = await fetch('/api/stores/scan-coupon', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          coupon_id: validation.coupon.id,
          store_id: selectedStore.id
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setScanStatus('redeemed');

        // Add to history
        setSessionHistory(prev => [{
          code: validation.coupon?.code,
          prize_name: validation.coupon?.prize_name,
          is_cross_store: validation.coupon?.is_cross_store,
          store_name: selectedStore.name,
          redeemed_at: new Date().toISOString()
        }, ...prev]);
      } else {
        setErrorMessage(result.error || 'Erreur lors de la validation');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la validation');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      verifyCode(manualCode.trim().toUpperCase());
    }
  };

  const selectStore = (store: StoreType, org: OrganizationWithStores) => {
    setSelectedStore(store);
    setSelectedOrg(org);
    setShowStoreDropdown(false);
    localStorage.setItem('currentStoreId', store.id);
    localStorage.setItem('currentOrgId', org.id);
  };

  if (!user || !merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7209B7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout merchant={merchant}>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan Cross-Store</h1>
          <p className="text-gray-600">
            Validez les coupons gagnants de n'importe quel magasin de votre organisation.
          </p>
        </div>

        {/* Store Selector */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Magasin actuel</p>
                <p className="font-semibold text-gray-900">
                  {selectedStore?.name || 'Selectionner un magasin'}
                </p>
              </div>
            </div>

            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowStoreDropdown(!showStoreDropdown)}
                className="gap-2"
              >
                Changer
                <ChevronDown className={`w-4 h-4 transition-transform ${showStoreDropdown ? 'rotate-180' : ''}`} />
              </Button>

              {showStoreDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowStoreDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="max-h-80 overflow-y-auto">
                      {organizations.map((org) => (
                        <div key={org.id}>
                          <div className="px-3 py-2 bg-gray-50 flex items-center gap-2 border-b">
                            <Building2 className="w-4 h-4" style={{ color: org.primary_color }} />
                            <span className="text-sm font-medium text-gray-700">{org.name}</span>
                          </div>
                          {org.stores?.map((store) => (
                            <button
                              key={store.id}
                              onClick={() => selectStore(store, org)}
                              className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                                selectedStore?.id === store.id ? 'bg-orange-50' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Store className="w-4 h-4 text-gray-400" />
                                <div className="text-left">
                                  <p className="text-sm font-medium text-gray-900">{store.name}</p>
                                  <p className="text-xs text-gray-500">{store.city || 'Adresse non definie'}</p>
                                </div>
                              </div>
                              {selectedStore?.id === store.id && (
                                <Check className="w-4 h-4 text-orange-500" />
                              )}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {selectedOrg?.allow_cross_store_redemption && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              Recuperation cross-store activee pour cette organisation
            </div>
          )}
        </Card>

        {/* Scanner Card */}
        <Card className="p-6">
          {scanStatus === 'idle' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pret a scanner</h3>
              <p className="text-gray-500 mb-8">Scannez le QR code du coupon gagnant ou entrez le code manuellement.</p>

              <div className="space-y-4">
                <Button onClick={startScanning} size="lg" className="bg-orange-500 hover:bg-orange-600 w-full">
                  Lancer le scan
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <Input
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="Entrer le code (ex: ABC-1234)"
                    className="font-mono text-center"
                  />
                  <Button type="submit" variant="outline" disabled={!manualCode.trim()}>
                    Verifier
                  </Button>
                </form>
              </div>
            </div>
          )}

          {scanStatus === 'selecting-store' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selectionnez un magasin</h3>
              <p className="text-gray-500 mb-6">Vous devez choisir le magasin ou vous vous trouvez avant de scanner.</p>
              <Button onClick={() => setShowStoreDropdown(true)} className="bg-orange-500 hover:bg-orange-600">
                Choisir un magasin
              </Button>
            </div>
          )}

          {scanStatus === 'scanning' && (
            <div className="w-full">
              <div id="cross-store-reader" className="w-full overflow-hidden rounded-lg"></div>
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou entrer le code</span>
                  </div>
                </div>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <Input
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="Code (ex: ABC-1234)"
                    className="font-mono text-center"
                  />
                  <Button type="submit" variant="outline" disabled={!manualCode.trim()}>
                    OK
                  </Button>
                </form>
                <Button onClick={() => setScanStatus('idle')} variant="outline" className="w-full">
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {scanStatus === 'verifying' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium">Verification du coupon...</p>
            </div>
          )}

          {scanStatus === 'valid' && validation?.coupon && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">Coupon Valide !</h2>

              {validation.coupon.is_cross_store && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg mb-4 inline-flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Coupon d'un autre magasin
                </div>
              )}

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 max-w-sm mx-auto">
                {validation.coupon.prize_image && (
                  <img
                    src={validation.coupon.prize_image}
                    alt={validation.coupon.prize_name}
                    className="w-24 h-24 object-cover rounded-lg mx-auto mb-4"
                  />
                )}
                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Prix a remettre</p>
                <p className="text-3xl font-bold text-gray-900 mb-4">{validation.coupon.prize_name}</p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">Code: <span className="font-mono font-bold">{validation.coupon.code}</span></p>
                  <p className="text-xs text-gray-400 mt-1">Expire le: {new Date(validation.coupon.expires_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={() => setScanStatus('idle')} variant="outline">
                  Annuler
                </Button>
                <Button onClick={redeemCoupon} size="lg" className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30">
                  Valider la remise du prix
                </Button>
              </div>
            </div>
          )}

          {scanStatus === 'invalid' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-red-700 mb-2">Coupon Invalide</h2>
              <p className="text-gray-600 mb-8 max-w-xs mx-auto">{errorMessage}</p>
              <Button onClick={startScanning} className="bg-gray-900 hover:bg-gray-800">
                <RefreshCw className="w-4 h-4 mr-2" />
                Scanner un autre code
              </Button>
            </div>
          )}

          {scanStatus === 'redeemed' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Prix Valide !</h2>
              <p className="text-gray-600 mb-8">Le coupon a ete marque comme utilise avec succes.</p>
              <Button onClick={startScanning} size="lg" className="bg-orange-500 hover:bg-orange-600">
                Scanner un autre coupon
              </Button>
            </div>
          )}
        </Card>

        {/* Session History */}
        {sessionHistory.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique de la session</h3>
            <div className="space-y-4">
              {sessionHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.prize_name}</p>
                      <p className="text-sm text-gray-500 font-mono">{item.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {item.is_cross_store && (
                        <Badge variant="secondary" className="text-xs">Cross-store</Badge>
                      )}
                      <span className="text-sm font-medium text-green-600">Valide</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(item.redeemed_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
