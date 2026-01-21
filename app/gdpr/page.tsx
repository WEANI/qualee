'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Menu, X, Check, ArrowRight } from 'lucide-react';

export default function GDPRPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const rights = [
    {
      title: "Droit d'accès",
      description: "Vous pouvez demander à connaître les données personnelles que nous détenons sur vous."
    },
    {
      title: "Droit de rectification",
      description: "Vous pouvez demander la correction de données inexactes ou incomplètes."
    },
    {
      title: "Droit à l'effacement",
      description: "Vous pouvez demander la suppression de vos données dans certaines conditions."
    },
    {
      title: "Droit à la limitation",
      description: "Vous pouvez demander la limitation du traitement de vos données."
    },
    {
      title: "Droit à la portabilité",
      description: "Vous pouvez recevoir vos données dans un format structuré et courant."
    },
    {
      title: "Droit d'opposition",
      description: "Vous pouvez vous opposer au traitement de vos données à tout moment."
    }
  ];

  const measures = [
    "Chiffrement des données en transit et au repos (AES-256)",
    "Authentification à deux facteurs disponible",
    "Contrôles d'accès stricts basés sur les rôles",
    "Surveillance continue et détection des intrusions",
    "Sauvegardes régulières et plan de reprise d'activité",
    "Formation régulière du personnel sur la protection des données",
    "Audits de sécurité périodiques",
    "Hébergement des données dans l'Union Européenne"
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2">
              <img src="/Logo Qualee pink violet.png" alt="Qualee" className="h-8 md:h-10 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/landing#fonctionnement" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Comment ça marche</Link>
              <Link href="/landing#fonctionnalites" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Fonctionnalités</Link>
              <Link href="/landing#tarifs" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Tarifs</Link>
              <Link href="/landing#faq" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">FAQ</Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-[#7209B7] transition-colors text-sm">Connexion</Link>
              <Link href="/auth/signup" className="px-5 py-2.5 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-semibold rounded-full hover:from-[#f540ad] hover:to-[#8a1ed1] transition-all text-sm">
                Essai gratuit
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:text-[#EB1E99]">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4">
            <div className="flex flex-col gap-4">
              <Link href="/landing#fonctionnement" className="text-gray-600 hover:text-[#EB1E99] transition-colors py-2">Comment ça marche</Link>
              <Link href="/landing#fonctionnalites" className="text-gray-600 hover:text-[#EB1E99] transition-colors py-2">Fonctionnalités</Link>
              <Link href="/landing#tarifs" className="text-gray-600 hover:text-[#EB1E99] transition-colors py-2">Tarifs</Link>
              <Link href="/landing#faq" className="text-gray-600 hover:text-[#EB1E99] transition-colors py-2">FAQ</Link>
              <hr className="border-gray-200" />
              <Link href="/auth/login" className="text-gray-600 hover:text-[#7209B7] transition-colors py-2">Connexion</Link>
              <Link href="/auth/signup" className="px-5 py-3 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-semibold rounded-full text-center">
                Essai gratuit
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-12 px-4 bg-gradient-to-br from-white via-[#EB1E99]/5 to-[#7209B7]/5">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A7E1]/10 border border-[#00A7E1]/20 rounded-full mb-6">
            <ShieldCheck className="w-4 h-4 text-[#00A7E1]" />
            <span className="text-[#00A7E1] text-sm font-medium">Conformité européenne</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Conformité{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
              RGPD
            </span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chez Qualee, la protection de vos données est notre priorité. Nous nous conformons
            strictement au Règlement Général sur la Protection des Données (RGPD).
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre engagement RGPD</h2>
            <p className="text-gray-600 mb-6">
              Le RGPD (Règlement Général sur la Protection des Données) est entré en vigueur le 25 mai 2018.
              Ce règlement européen renforce les droits des individus concernant leurs données personnelles
              et responsabilise les organisations qui les traitent.
            </p>

            <p className="text-gray-600 mb-8">
              En tant que plateforme de fidélisation client, nous traitons des données personnelles pour
              le compte de nos clients (responsables de traitement). Nous agissons en qualité de
              sous-traitant et nous nous engageons à respecter toutes les exigences du RGPD.
            </p>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Vos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                droits
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Le RGPD vous confère des droits spécifiques concernant vos données personnelles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rights.map((right, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#EB1E99]/50 hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#EB1E99] to-[#7209B7] rounded-xl flex items-center justify-center mb-4">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{right.title}</h3>
                <p className="text-gray-600 text-sm">{right.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Mesures de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                sécurité
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nous mettons en œuvre des mesures techniques et organisationnelles robustes pour protéger vos données.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#EB1E99]/5 to-[#7209B7]/5 rounded-3xl p-8 border border-[#EB1E99]/10">
            <div className="grid md:grid-cols-2 gap-4">
              {measures.map((measure, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-gray-700">{measure}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DPO & Contact */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Délégué à la Protection des Données (DPO)</h2>
            <p className="text-gray-600 mb-6">
              Nous avons désigné un Délégué à la Protection des Données qui supervise notre conformité
              au RGPD et répond à vos questions concernant le traitement de vos données personnelles.
            </p>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <p className="text-gray-700"><strong>Contact DPO :</strong></p>
              <p className="text-gray-700">Email : dpo@qualee.fr</p>
              <p className="text-gray-700">Adresse : Qualee - DPO, 123 Rue de la Beauté, 75001 Paris</p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Exercer vos droits</h2>
            <p className="text-gray-600 mb-4">
              Pour exercer vos droits ou pour toute question relative à la protection de vos données,
              vous pouvez nous contacter :
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Par email : privacy@qualee.fr</li>
              <li>Via notre formulaire de contact</li>
              <li>Par courrier à l'adresse ci-dessus</li>
            </ul>

            <p className="text-gray-600 mb-6">
              Nous nous engageons à répondre à toute demande dans un délai d'un mois.
              Ce délai peut être prolongé de deux mois si la demande est complexe.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Réclamation</h2>
            <p className="text-gray-600 mb-6">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une
              réclamation auprès de l'autorité de contrôle compétente :
            </p>

            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-gray-700"><strong>CNIL (Commission Nationale de l'Informatique et des Libertés)</strong></p>
              <p className="text-gray-700">3 Place de Fontenoy, TSA 80715</p>
              <p className="text-gray-700">75334 Paris Cedex 07</p>
              <p className="text-gray-700">Site web : www.cnil.fr</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-[#EB1E99]/10 via-[#7209B7]/10 to-[#3A0CA3]/10 rounded-[2rem] p-8 md:p-12 text-center overflow-hidden border border-[#EB1E99]/20">
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                Des questions sur la protection de vos données ?
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Notre équipe est là pour répondre à toutes vos interrogations sur notre conformité RGPD.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-bold rounded-full hover:from-[#f540ad] hover:to-[#8a1ed1] transition-all shadow-lg shadow-[#EB1E99]/25"
              >
                Nous contacter
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <img src="/Logo Qualee pink violet.png" alt="Qualee" className="h-10 w-auto mb-4" />
              <p className="text-gray-600 text-sm mb-6">
                La solution de fidélisation client nouvelle génération pour les professionnels de la beauté.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Produit</h4>
              <ul className="space-y-3">
                <li><Link href="/landing#fonctionnement" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Comment ça marche</Link></li>
                <li><Link href="/landing#fonctionnalites" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Fonctionnalités</Link></li>
                <li><Link href="/landing#tarifs" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Tarifs</Link></li>
                <li><Link href="/landing#faq" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Entreprise</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">À propos</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Contact</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Blog</Link></li>
                <li><Link href="/careers" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Carrières</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Légal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Politique de confidentialité</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Conditions d'utilisation</Link></li>
                <li><Link href="/cookies" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Cookies</Link></li>
                <li><Link href="/gdpr" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">RGPD</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Qualee. Tous droits réservés.</p>
            <p className="text-gray-500 text-sm">Fait avec ❤️ pour les professionnels de la beauté</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
