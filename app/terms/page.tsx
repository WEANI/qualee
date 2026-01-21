'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Menu, X } from 'lucide-react';

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#7209B7]/10 border border-[#7209B7]/20 rounded-full mb-6">
            <FileText className="w-4 h-4 text-[#7209B7]" />
            <span className="text-[#7209B7] text-sm font-medium">Mentions légales</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Conditions Générales{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
              d'Utilisation
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Présentation du service</h2>
            <p className="text-gray-600 mb-6">
              Qualee est une plateforme SaaS de fidélisation client destinée aux professionnels de la beauté.
              Elle permet de gérer des programmes de fidélité, de collecter des avis clients et d'automatiser
              les communications via WhatsApp.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Acceptation des conditions</h2>
            <p className="text-gray-600 mb-6">
              En créant un compte ou en utilisant nos services, vous acceptez sans réserve les présentes
              Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, vous ne devez
              pas utiliser notre plateforme.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Création de compte</h2>
            <p className="text-gray-600 mb-4">Pour utiliser Qualee, vous devez :</p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Être une personne physique majeure ou une personne morale</li>
              <li>Fournir des informations exactes et à jour</li>
              <li>Maintenir la confidentialité de vos identifiants de connexion</li>
              <li>Nous informer immédiatement de toute utilisation non autorisée</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Description des services</h2>
            <p className="text-gray-600 mb-4">Qualee propose les fonctionnalités suivantes :</p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Carte de fidélité digitale sur WhatsApp</li>
              <li>Roue des cadeaux personnalisable</li>
              <li>Collecte et gestion des avis Google</li>
              <li>Tableau de bord analytique</li>
              <li>Automatisation des communications</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Tarification et paiement</h2>
            <p className="text-gray-600 mb-6">
              Les tarifs en vigueur sont affichés sur notre site. Les abonnements sont facturés mensuellement
              ou annuellement selon l'option choisie. Les paiements sont prélevés automatiquement via
              les moyens de paiement enregistrés.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Période d'essai</h2>
            <p className="text-gray-600 mb-6">
              Une période d'essai gratuite de 14 jours est proposée. À l'issue de cette période,
              votre abonnement sera automatiquement converti en abonnement payant sauf résiliation
              de votre part avant la fin de l'essai.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Utilisation acceptable</h2>
            <p className="text-gray-600 mb-4">Vous vous engagez à ne pas :</p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Utiliser le service à des fins illégales</li>
              <li>Envoyer du spam ou des communications non sollicitées</li>
              <li>Tenter de contourner les mesures de sécurité</li>
              <li>Revendre ou sous-licencier l'accès au service</li>
              <li>Collecter des données sans consentement des personnes concernées</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Propriété intellectuelle</h2>
            <p className="text-gray-600 mb-6">
              Tous les éléments de la plateforme (logo, design, code, contenu) sont la propriété
              exclusive de Qualee. Toute reproduction ou utilisation non autorisée est interdite.
              Vous conservez la propriété de vos données et contenus.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disponibilité du service</h2>
            <p className="text-gray-600 mb-6">
              Nous nous efforçons de maintenir une disponibilité optimale (99,9%). Des interruptions
              peuvent survenir pour maintenance ou mises à jour. Nous vous informerons dans la mesure
              du possible des maintenances programmées.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Responsabilité</h2>
            <p className="text-gray-600 mb-6">
              Qualee ne pourra être tenue responsable des dommages indirects résultant de l'utilisation
              du service. Notre responsabilité est limitée au montant des sommes versées au cours
              des 12 derniers mois.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Résiliation</h2>
            <p className="text-gray-600 mb-6">
              Vous pouvez résilier votre abonnement à tout moment depuis votre espace client.
              La résiliation prend effet à la fin de la période en cours. Nous nous réservons
              le droit de suspendre ou résilier votre compte en cas de violation des présentes conditions.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Modifications</h2>
            <p className="text-gray-600 mb-6">
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications
              entreront en vigueur 30 jours après leur publication. L'utilisation continue du service
              vaut acceptation des nouvelles conditions.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Droit applicable</h2>
            <p className="text-gray-600 mb-6">
              Les présentes conditions sont régies par le droit français. Tout litige sera soumis
              à la compétence exclusive des tribunaux de Paris.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact</h2>
            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-gray-700"><strong>Qualee SAS</strong></p>
              <p className="text-gray-700">123 Rue de la Beauté, 75001 Paris</p>
              <p className="text-gray-700">Email : legal@qualee.fr</p>
              <p className="text-gray-700">SIRET : XXX XXX XXX XXXXX</p>
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
