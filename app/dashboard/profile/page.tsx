'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  Save,
  Palette,
  Upload,
  Image,
  Trash2
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'informations' | 'apparence'>('informations');

  // Apparence state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [logoBackgroundColor, setLogoBackgroundColor] = useState('#FFFFFF');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

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
        setLogoBackgroundColor(merchantData.logo_background_color || '#FFFFFF');
      }
    };

    checkAuth();
  }, [router]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const processLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const processBackgroundFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setBackgroundFile(file);
    setBackgroundPreview(URL.createObjectURL(file));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processBackgroundFile(file);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleBackgroundDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) processBackgroundFile(file);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const updates: any = {
        name: formData.name || null,
        business_name: formData.business_name || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        country: formData.country || null,
        website: formData.website || null,
        siret: formData.siret || null,
        logo_background_color: logoBackgroundColor || '#FFFFFF',
      };

      // Upload logo if changed
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `logo-${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('merchant-assets')
          .upload(fileName, logoFile, { cacheControl: '3600', upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('merchant-assets').getPublicUrl(fileName);
        updates.logo_url = urlData.publicUrl;
      }

      // Upload background if changed
      if (backgroundFile) {
        const fileExt = backgroundFile.name.split('.').pop();
        const fileName = `bg-${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('merchant-assets')
          .upload(fileName, backgroundFile, { cacheControl: '3600', upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('merchant-assets').getPublicUrl(fileName);
        updates.background_url = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('merchants')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setLogoFile(null);
      setBackgroundFile(null);

      // Refresh merchant data
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      setMerchant(merchantData);
      if (merchantData) {
        setLogoPreview(null);
        setBackgroundPreview(null);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour du profil' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
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
      setLogoBackgroundColor(merchant.logo_background_color || '#FFFFFF');
      setLogoFile(null);
      setLogoPreview(null);
      setBackgroundFile(null);
      setBackgroundPreview(null);
    }
  };

  const inputClassName = "w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-violet-50/30";

  if (!user || !merchant) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
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
            <User className="w-7 h-7 text-violet-600" />
            Mon Profil
          </h1>
          <p className="text-slate-500 mt-1">Gérez les informations de votre entreprise</p>
        </div>

        {/* Message */}
        {message && (
          <Card className={`p-3 sm:p-4 ${
            message.type === 'success' ? 'bg-indigo-50 border-indigo-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              ) : (
                <X className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <p className={`font-medium text-sm ${
                message.type === 'success' ? 'text-indigo-700' : 'text-red-700'
              }`}>{message.text}</p>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-0">
          {[
            { key: 'informations' as const, label: 'Informations', icon: Building2 },
            { key: 'apparence' as const, label: 'Apparence', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 -mb-[1px] ${
                  activeTab === tab.key
                    ? 'border-violet-600 text-violet-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Informations */}
        {activeTab === 'informations' && (<>
        {/* Informations du commerce - merged */}
        <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="profile-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-violet-50">
                <Building2 className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Informations du commerce</h2>
                <p className="text-xs sm:text-sm text-slate-500">Détails de votre établissement et du gérant</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne 1 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nom de l&apos;établissement
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
                    Téléphone
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

              {/* Colonne 2 */}
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
                    <Phone className="w-4 h-4 text-slate-400" />
                    Téléphone du Gérant
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
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
              </div>
            </div>
          </div>
        </div>

        {/* Adresse de l'établissement */}
        <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="profile-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-violet-50">
                <MapPin className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Adresse de l&apos;établissement</h2>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-violet-50/30"
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
        </>)}

        {/* Tab 2: Apparence */}
        {activeTab === 'apparence' && (<>
        {/* Logo de l'établissement */}
        <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="profile-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-violet-50">
                <Upload className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Logo de l&apos;établissement</h2>
                <p className="text-xs sm:text-sm text-slate-500">Le logo affiché sur la roue, les coupons et la page d&apos;avis</p>
              </div>
            </div>

            <div
              className="flex flex-col sm:flex-row items-start gap-6"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={handleLogoDrop}
            >
              <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                {logoPreview || merchant?.logo_url ? (
                  <>
                    <img
                      src={logoPreview || merchant.logo_url}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                        if (merchant) merchant.logo_url = null;
                      }}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <Upload className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  className="mb-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {(logoPreview || merchant?.logo_url) ? 'Changer le logo' : 'Ajouter un logo'}
                </Button>
                <p className="text-xs text-slate-500">PNG, JPG ou SVG. Taille recommandée : 512x512px</p>
                <p className="text-xs text-slate-400 mt-1">Glissez-déposez une image sur la zone</p>
                {logoFile && (
                  <p className="text-xs text-violet-600 mt-1">Nouveau fichier : {logoFile.name}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image d'arrière-plan */}
        <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="profile-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-violet-50">
                <Image className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Image d&apos;arrière-plan</h2>
                <p className="text-xs sm:text-sm text-slate-500">Image de fond affichée sur les pages client (roue, avis, coupon)</p>
              </div>
            </div>

            <div
              className="flex flex-col sm:flex-row items-start gap-6"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={handleBackgroundDrop}
            >
              <div className="relative w-40 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                {backgroundPreview || merchant?.background_url ? (
                  <>
                    <img
                      src={backgroundPreview || merchant.background_url}
                      alt="Arrière-plan"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBackgroundFile(null);
                        setBackgroundPreview(null);
                        if (merchant) merchant.background_url = null;
                      }}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <Image className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={bgInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => bgInputRef.current?.click()}
                  className="mb-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {(backgroundPreview || merchant?.background_url) ? "Changer l'image" : 'Ajouter une image'}
                </Button>
                <p className="text-xs text-slate-500">PNG ou JPG. Taille recommandée : 1920x1080px</p>
                <p className="text-xs text-slate-400 mt-1">Glissez-déposez une image sur la zone</p>
                {backgroundFile && (
                  <p className="text-xs text-violet-600 mt-1">Nouveau fichier : {backgroundFile.name}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Couleur de fond du logo */}
        <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="profile-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-violet-50">
                <Palette className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Couleur de Fond du Logo</h2>
                <p className="text-xs sm:text-sm text-slate-500">Couleur de fond du cercle contenant votre logo sur la roue et la page coupon</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-700">Couleur :</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={logoBackgroundColor}
                    onChange={(e) => setLogoBackgroundColor(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300 transition-colors duration-200 focus:border-violet-500"
                  />
                  <input
                    type="text"
                    value={logoBackgroundColor}
                    onChange={(e) => setLogoBackgroundColor(e.target.value)}
                    placeholder="#FFFFFF"
                    className="w-28 px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Aperçu :</span>
                <div
                  className="w-16 h-16 rounded-full border-4 border-[#ffd700] flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: logoBackgroundColor }}
                >
                  {merchant?.logo_url ? (
                    <img
                      src={merchant.logo_url}
                      alt="Logo"
                      className="w-12 h-12 object-contain rounded-full"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">Logo</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              {[
                { label: 'Blanc', value: '#FFFFFF' },
                { label: 'Noir', value: '#000000' },
                { label: 'Or', value: '#FFD700' },
                { label: 'Bleu nuit', value: '#1a1a2e' },
              ].map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setLogoBackgroundColor(preset.value)}
                  className="px-3 py-1.5 text-xs rounded-full border transition-all duration-200"
                  style={{
                    backgroundColor: logoBackgroundColor === preset.value ? '#F5F3FF' : 'white',
                    borderColor: logoBackgroundColor === preset.value ? '#7209B7' : '#e5e7eb',
                    color: logoBackgroundColor === preset.value ? '#7209B7' : '#6b7280',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        </>)}

        {/* Save Button - always visible */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto transition-all duration-200"
          >
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white transition-all duration-200"
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
