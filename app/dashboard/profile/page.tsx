'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Check,
  X,
  Loader2,
  Save
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    email: '',
    phone: '',
    shop_phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'France',
    website: '',
    siret: '',
  });

  useEffect(() => {
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

      if (merchantData) {
        setFormData({
          name: merchantData.name || '',
          business_name: merchantData.business_name || '',
          email: merchantData.email || user.email || '',
          phone: merchantData.phone || '',
          shop_phone: merchantData.shop_phone || '',
          address: merchantData.address || '',
          city: merchantData.city || '',
          postal_code: merchantData.postal_code || '',
          country: merchantData.country || 'France',
          website: merchantData.website || '',
          siret: merchantData.siret || '',
        });
      }
    };

    checkAuth();
  }, [router]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('merchants')
        .update({
          name: formData.name || null,
          business_name: formData.business_name || null,
          phone: formData.phone || null,
          shop_phone: formData.shop_phone || null,
          address: formData.address || null,
          city: formData.city || null,
          postal_code: formData.postal_code || null,
          country: formData.country || null,
          website: formData.website || null,
          siret: formData.siret || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });

      // Refresh merchant data
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      setMerchant(merchantData);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour du profil' });
    } finally {
      setSaving(false);
    }
  };

  const inputClassName = "w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-teal-50/30";

  if (!user || !merchant) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout merchant={merchant}>
      <style jsx global>{`
        @keyframes fadeInProfile {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .profile-animate {
          animation: fadeInProfile 0.3s ease-out;
        }
        .profile-icon-enter {
          animation: slideInLeft 0.3s ease-out;
        }
      `}</style>

      <div className="space-y-4 sm:space-y-6 profile-animate">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <User className="w-7 h-7 text-teal-600" />
            Mon Profil
          </h1>
          <p className="text-slate-500 mt-1">Gérez les informations de votre entreprise</p>
        </div>

        {/* Message */}
        {message && (
          <Card className={`p-3 sm:p-4 ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <X className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <p className={`font-medium text-sm ${
                message.type === 'success' ? 'text-emerald-700' : 'text-red-700'
              }`}>{message.text}</p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Informations personnelles */}
          <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
            <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="profile-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-teal-50">
                  <User className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">Gérant</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Informations du responsable de l&apos;établissement</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nom du gérant
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Jean Dupont"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-100 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">L&apos;email ne peut pas être modifié</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    Téléphone du gérant
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Informations entreprise */}
          <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
            <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="profile-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-teal-50">
                  <Building2 className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">Informations du shop</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Détails de votre établissement</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nom du shop
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => handleChange('business_name', e.target.value)}
                    placeholder="Ma Boutique"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    Téléphone du shop
                  </label>
                  <input
                    type="tel"
                    value={formData.shop_phone}
                    onChange={(e) => handleChange('shop_phone', e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                    <FileText className="w-4 h-4 text-slate-400" />
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={formData.siret}
                    onChange={(e) => handleChange('siret', e.target.value)}
                    placeholder="123 456 789 00012"
                    maxLength={17}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                    <Globe className="w-4 h-4 text-slate-400" />
                    Site web
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://www.monsite.fr"
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white lg:col-span-2">
            <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="profile-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-teal-50">
                  <MapPin className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">Adresse du shop</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Localisation de votre établissement</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="123 Rue de la Paix"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Paris"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => handleChange('postal_code', e.target.value)}
                    placeholder="75001"
                    maxLength={10}
                    className={inputClassName}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Pays
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-teal-50/30"
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Canada">Canada</option>
                    <option value="Maroc">Maroc</option>
                    <option value="Tunisie">Tunisie</option>
                    <option value="Algérie">Algérie</option>
                    <option value="Sénégal">Sénégal</option>
                    <option value="Côte d&apos;Ivoire">Côte d&apos;Ivoire</option>
                    <option value="Cameroun">Cameroun</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (merchant) {
                setFormData({
                  name: merchant.name || '',
                  business_name: merchant.business_name || '',
                  email: merchant.email || user.email || '',
                  phone: merchant.phone || '',
                  shop_phone: merchant.shop_phone || '',
                  address: merchant.address || '',
                  city: merchant.city || '',
                  postal_code: merchant.postal_code || '',
                  country: merchant.country || 'France',
                  website: merchant.website || '',
                  siret: merchant.siret || '',
                });
              }
            }}
            className="w-full sm:w-auto transition-all duration-200"
          >
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
