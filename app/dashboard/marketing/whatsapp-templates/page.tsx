'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import {
  MessageSquare,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Image,
  Video,
  Type,
  Link2,
  Reply,
  Send,
  Eye,
} from 'lucide-react';

interface Template {
  id: string;
  template_name: string;
  language: string;
  category: string;
  status: string;
  components: any[];
  last_synced_at: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approuve' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejete' },
  PAUSED: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Pause' },
  DISABLED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Desactive' },
};

const LANGUAGES = [
  { code: 'fr', label: 'Francais' },
  { code: 'en', label: 'English' },
  { code: 'en_US', label: 'English (US)' },
  { code: 'es', label: 'Espanol' },
  { code: 'pt_BR', label: 'Portugues' },
  { code: 'th', label: 'Thai' },
  { code: 'ar', label: 'Arabe' },
  { code: 'zh_CN', label: 'Chinois' },
];

export default function WhatsAppTemplatesPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [configured, setConfigured] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [formName, setFormName] = useState('');
  const [formLanguage, setFormLanguage] = useState('fr');
  const [formCategory, setFormCategory] = useState('MARKETING');
  const [formHeaderType, setFormHeaderType] = useState<'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO'>('NONE');
  const [formHeaderText, setFormHeaderText] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formFooter, setFormFooter] = useState('');
  const [formButtons, setFormButtons] = useState<{ type: 'URL' | 'QUICK_REPLY'; text: string; url?: string }[]>([]);

  // Preview
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!merchantData) { router.push('/auth/login'); return; }
      setMerchant(merchantData);

      const res = await fetch(`/api/whatsapp/templates?merchantId=${user.id}`);
      const data = await res.json();
      setTemplates(data.templates || []);
      setConfigured(data.configured);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    if (!merchant) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/whatsapp/templates/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: merchant.id }),
      });
      const data = await res.json();
      setSyncResult(data);
      if (data.success) await loadData();
    } catch {
      setSyncResult({ error: 'Erreur connexion' });
    } finally {
      setSyncing(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!merchant) return;
    setCreating(true);
    setCreateError('');

    const components: any[] = [];

    if (formHeaderType !== 'NONE') {
      const header: any = { type: 'HEADER' };
      if (formHeaderType === 'TEXT') {
        header.format = 'TEXT';
        header.text = formHeaderText;
      } else {
        header.format = formHeaderType;
      }
      components.push(header);
    }

    components.push({
      type: 'BODY',
      text: formBody,
    });

    if (formFooter) {
      components.push({ type: 'FOOTER', text: formFooter });
    }

    if (formButtons.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: formButtons.map(b => {
          if (b.type === 'URL') {
            return { type: 'URL', text: b.text, url: b.url, example: b.url ? [b.url] : undefined };
          }
          return { type: 'QUICK_REPLY', text: b.text };
        }),
      });
    }

    try {
      const res = await fetch('/api/whatsapp/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant.id,
          name: formName,
          language: formLanguage,
          category: formCategory,
          components,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setCreateError(data.error);
      } else {
        setShowCreate(false);
        resetForm();
        await loadData();
      }
    } catch {
      setCreateError('Erreur de connexion');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce template ?')) return;
    try {
      await fetch(`/api/whatsapp/templates/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  function resetForm() {
    setFormName('');
    setFormLanguage('fr');
    setFormCategory('MARKETING');
    setFormHeaderType('NONE');
    setFormHeaderText('');
    setFormBody('');
    setFormFooter('');
    setFormButtons([]);
    setCreateError('');
  }

  function getBodyText(template: Template) {
    const body = template.components?.find((c: any) => c.type === 'BODY');
    return body?.text || '';
  }

  function getHeaderInfo(template: Template) {
    const header = template.components?.find((c: any) => c.type === 'HEADER');
    if (!header) return null;
    return header;
  }

  function getButtons(template: Template) {
    const btns = template.components?.find((c: any) => c.type === 'BUTTONS');
    return btns?.buttons || [];
  }

  if (loading) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout merchant={merchant}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              Templates WhatsApp
            </h1>
            <p className="text-gray-500 mt-1">Gerez vos templates de messages Meta</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSync} disabled={syncing || !configured} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Synchroniser
            </Button>
            <Button onClick={() => { resetForm(); setShowCreate(true); }} disabled={!configured} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Creer un template
            </Button>
          </div>
        </div>

        {!configured && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-semibold text-amber-800">WhatsApp Business non configure</h3>
            <p className="text-sm text-amber-700 mt-1">
              Contactez l&apos;administrateur pour configurer votre compte WhatsApp Business API.
            </p>
          </div>
        )}

        {syncResult && (
          <div className={`rounded-xl p-4 ${syncResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {syncResult.success ? (
              <p className="text-sm text-green-700"><CheckCircle className="w-4 h-4 inline mr-1" />{syncResult.synced} templates synchronises</p>
            ) : (
              <p className="text-sm text-red-700"><AlertCircle className="w-4 h-4 inline mr-1" />{syncResult.error}</p>
            )}
          </div>
        )}

        {/* Template List */}
        <div className="grid gap-4">
          {templates.length === 0 && configured && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucun template. Synchronisez depuis Meta ou creez-en un nouveau.</p>
            </div>
          )}

          {templates.map((template) => {
            const status = STATUS_COLORS[template.status] || STATUS_COLORS.PENDING;
            const header = getHeaderInfo(template);
            const buttons = getButtons(template);

            return (
              <div key={template.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{template.template_name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-gray-400 uppercase">{template.language}</span>
                      <span className="text-xs text-gray-400">{template.category}</span>
                    </div>

                    {header && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        {header.format === 'IMAGE' && <><Image className="w-3 h-3" /> Image</>}
                        {header.format === 'VIDEO' && <><Video className="w-3 h-3" /> Video</>}
                        {header.format === 'TEXT' && <><Type className="w-3 h-3" /> {header.text}</>}
                      </div>
                    )}

                    <p className="text-sm text-gray-600 line-clamp-2">{getBodyText(template)}</p>

                    {buttons.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        {buttons.map((btn: any, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
                            {btn.type === 'URL' ? <Link2 className="w-3 h-3" /> : <Reply className="w-3 h-3" />}
                            {btn.text}
                          </span>
                        ))}
                      </div>
                    )}

                    {template.last_synced_at && (
                      <p className="text-xs text-gray-400 mt-2">
                        Synchro : {new Date(template.last_synced_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setPreviewTemplate(previewTemplate?.id === template.id ? null : template)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Preview Panel */}
                {previewTemplate?.id === template.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Apercu du message</h4>
                    <div className="bg-white rounded-xl p-4 max-w-sm shadow-sm border border-gray-200">
                      {header?.format === 'TEXT' && (
                        <p className="font-semibold text-gray-900 mb-1">{header.text}</p>
                      )}
                      {(header?.format === 'IMAGE' || header?.format === 'VIDEO') && (
                        <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center mb-2">
                          {header.format === 'IMAGE' ? <Image className="w-8 h-8 text-gray-400" /> : <Video className="w-8 h-8 text-gray-400" />}
                        </div>
                      )}
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{getBodyText(template)}</p>
                      {template.components?.find((c: any) => c.type === 'FOOTER') && (
                        <p className="text-xs text-gray-400 mt-2">{template.components.find((c: any) => c.type === 'FOOTER')?.text}</p>
                      )}
                      {buttons.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                          {buttons.map((btn: any, i: number) => (
                            <div key={i} className="text-center py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                              {btn.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Create Template Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 my-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Creer un template</h2>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du template</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="ex: promo_weekend"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500"
                      required
                      pattern="[a-z0-9_]+"
                      title="Lettres minuscules, chiffres et underscores uniquement"
                    />
                    <p className="text-xs text-gray-400 mt-1">Minuscules, chiffres, _ uniquement</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                      <select value={formLanguage} onChange={(e) => setFormLanguage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm">
                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
                      <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm">
                        <option value="MARKETING">Marketing</option>
                        <option value="UTILITY">Utilitaire</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Header */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Header (optionnel)</label>
                  <div className="flex gap-2 mb-2">
                    {(['NONE', 'TEXT', 'IMAGE', 'VIDEO'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormHeaderType(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${formHeaderType === t ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {t === 'NONE' ? 'Aucun' : t === 'TEXT' ? 'Texte' : t === 'IMAGE' ? 'Image' : 'Video'}
                      </button>
                    ))}
                  </div>
                  {formHeaderType === 'TEXT' && (
                    <input
                      type="text"
                      value={formHeaderText}
                      onChange={(e) => setFormHeaderText(e.target.value)}
                      placeholder="Titre du message"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                      maxLength={60}
                    />
                  )}
                  {(formHeaderType === 'IMAGE' || formHeaderType === 'VIDEO') && (
                    <p className="text-xs text-gray-400">Le media sera ajoute lors de l&apos;envoi de la campagne</p>
                  )}
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Corps du message</label>
                  <textarea
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    placeholder={"Bonjour {{1}} !\n\nDecouvrez notre offre speciale : {{2}}\n\nRendez-vous dans notre boutique !"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm resize-none"
                    rows={5}
                    required
                    maxLength={1024}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Utilisez {"{{1}}"}, {"{{2}}"}, etc. pour les variables. {formBody.length}/1024
                  </p>
                </div>

                {/* Footer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer (optionnel)</label>
                  <input
                    type="text"
                    value={formFooter}
                    onChange={(e) => setFormFooter(e.target.value)}
                    placeholder="Ex: Repondez STOP pour se desabonner"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                    maxLength={60}
                  />
                </div>

                {/* Buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Boutons (max 3)</label>
                  {formButtons.map((btn, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <select
                        value={btn.type}
                        onChange={(e) => {
                          const updated = [...formButtons];
                          updated[i] = { ...btn, type: e.target.value as any };
                          setFormButtons(updated);
                        }}
                        className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                      >
                        <option value="URL">URL</option>
                        <option value="QUICK_REPLY">Reponse rapide</option>
                      </select>
                      <input
                        type="text"
                        value={btn.text}
                        onChange={(e) => {
                          const updated = [...formButtons];
                          updated[i] = { ...btn, text: e.target.value };
                          setFormButtons(updated);
                        }}
                        placeholder="Texte du bouton"
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                        maxLength={25}
                      />
                      {btn.type === 'URL' && (
                        <input
                          type="url"
                          value={btn.url || ''}
                          onChange={(e) => {
                            const updated = [...formButtons];
                            updated[i] = { ...btn, url: e.target.value };
                            setFormButtons(updated);
                          }}
                          placeholder="https://..."
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setFormButtons(formButtons.filter((_, j) => j !== i))}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formButtons.length < 3 && (
                    <button
                      type="button"
                      onClick={() => setFormButtons([...formButtons, { type: 'URL', text: '' }])}
                      className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Ajouter un bouton
                    </button>
                  )}
                </div>

                {createError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-700"><AlertCircle className="w-4 h-4 inline mr-1" />{createError}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={creating || !formName || !formBody} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    {creating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Soumettre a Meta
                  </Button>
                  <Button type="button" onClick={() => setShowCreate(false)} className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
