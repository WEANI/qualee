'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Cookie, Menu, X } from 'lucide-react';

export default function CookiesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3A0CA3]/10 border border-[#3A0CA3]/20 rounded-full mb-6">
            <Cookie className="w-4 h-4 text-[#3A0CA3]" />
            <span className="text-[#3A0CA3] text-sm font-medium">Transparence</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Politique des{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
              Cookies
            </span>
          </h1>

          <p className="text-gray-600">
            Dernière mise à jour : Janvier 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Qu'est-ce qu'un cookie ?</h2>
            <p className="text-gray-600 mb-6">
              Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, smartphone)
              lorsque vous visitez un site web. Les cookies permettent au site de mémoriser vos actions et
              préférences sur une période de temps.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Types de cookies utilisés</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Cookies essentiels</h3>
            <p className="text-gray-600 mb-4">
              Ces cookies sont nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-semibold">Nom</th>
                    <th className="text-left py-2 font-semibold">Finalité</th>
                    <th className="text-left py-2 font-semibold">Durée</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-2">session_id</td>
                    <td className="py-2">Authentification utilisateur</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">csrf_token</td>
                    <td className="py-2">Sécurité des formulaires</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="py-2">cookie_consent</td>
                    <td className="py-2">Mémorisation de vos choix</td>
                    <td className="py-2">1 an</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Cookies analytiques</h3>
            <p className="text-gray-600 mb-4">
              Ces cookies nous permettent de comprendre comment les visiteurs utilisent notre site.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-semibold">Nom</th>
                    <th className="text-left py-2 font-semibold">Fournisseur</th>
                    <th className="text-left py-2 font-semibold">Durée</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-2">_ga</td>
                    <td className="py-2">Google Analytics</td>
                    <td className="py-2">2 ans</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">_gid</td>
                    <td className="py-2">Google Analytics</td>
                    <td className="py-2">24 heures</td>
                  </tr>
                  <tr>
                    <td className="py-2">_gat</td>
                    <td className="py-2">Google Analytics</td>
                    <td className="py-2">1 minute</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Cookies fonctionnels</h3>
            <p className="text-gray-600 mb-6">
              Ces cookies permettent d'améliorer les fonctionnalités et la personnalisation,
              comme la mémorisation de votre langue préférée.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.4 Cookies marketing</h3>
            <p className="text-gray-600 mb-6">
              Ces cookies peuvent être utilisés pour vous proposer des publicités pertinentes
              en fonction de vos centres d'intérêt. Ils ne sont déposés qu'avec votre consentement.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Gestion des cookies</h2>
            <p className="text-gray-600 mb-4">
              Vous pouvez gérer vos préférences cookies de plusieurs manières :
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Via notre bandeau de consentement lors de votre première visite</li>
              <li>En modifiant vos préférences dans les paramètres de votre navigateur</li>
              <li>En utilisant des outils de gestion des cookies tiers</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Paramètres du navigateur</h2>
            <p className="text-gray-600 mb-4">
              Voici comment gérer les cookies dans les principaux navigateurs :
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
              <li><strong>Firefox :</strong> Options → Vie privée et sécurité → Cookies</li>
              <li><strong>Safari :</strong> Préférences → Confidentialité → Cookies</li>
              <li><strong>Edge :</strong> Paramètres → Confidentialité et services → Cookies</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Conséquences du refus</h2>
            <p className="text-gray-600 mb-6">
              Si vous refusez certains cookies, certaines fonctionnalités du site peuvent être
              limitées ou indisponibles. Les cookies essentiels ne peuvent pas être refusés
              car ils sont nécessaires au fonctionnement du site.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Mise à jour de cette politique</h2>
            <p className="text-gray-600 mb-6">
              Nous pouvons mettre à jour cette politique de cookies à tout moment. La date de
              dernière mise à jour est indiquée en haut de cette page.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact</h2>
            <p className="text-gray-600 mb-4">
              Pour toute question concernant notre utilisation des cookies :
            </p>
            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-gray-700"><strong>Email :</strong> privacy@qualee.fr</p>
              <p className="text-gray-700"><strong>Adresse :</strong> Qualee - DPO, 123 Rue de la Beauté, 75001 Paris</p>
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
