'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Menu, X } from 'lucide-react';

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EB1E99]/10 border border-[#EB1E99]/20 rounded-full mb-6">
            <Shield className="w-4 h-4 text-[#EB1E99]" />
            <span className="text-[#EB1E99] text-sm font-medium">Protection des données</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Politique de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
              Confidentialité
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-6">
              Chez Qualee, nous accordons une importance primordiale à la protection de vos données personnelles.
              Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons
              vos informations lorsque vous utilisez notre plateforme.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Données collectées</h2>
            <p className="text-gray-600 mb-4">Nous collectons les types de données suivants :</p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li><strong>Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
              <li><strong>Données de connexion :</strong> adresse IP, type de navigateur, données de session</li>
              <li><strong>Données d'utilisation :</strong> interactions avec la plateforme, préférences</li>
              <li><strong>Données clients :</strong> informations relatives aux clients de votre établissement</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Finalités du traitement</h2>
            <p className="text-gray-600 mb-4">Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Fournir et améliorer nos services de fidélisation client</li>
              <li>Gérer votre compte et vos abonnements</li>
              <li>Personnaliser votre expérience utilisateur</li>
              <li>Vous envoyer des communications relatives à nos services</li>
              <li>Assurer la sécurité de notre plateforme</li>
              <li>Respecter nos obligations légales</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Base légale du traitement</h2>
            <p className="text-gray-600 mb-6">
              Nous traitons vos données sur les bases légales suivantes : l'exécution du contrat qui nous lie,
              votre consentement explicite, nos intérêts légitimes ou le respect d'obligations légales.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Partage des données</h2>
            <p className="text-gray-600 mb-4">Nous pouvons partager vos données avec :</p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Nos sous-traitants techniques (hébergement, paiement, analytics)</li>
              <li>Les autorités compétentes si la loi l'exige</li>
              <li>Des partenaires commerciaux, avec votre consentement préalable</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Conservation des données</h2>
            <p className="text-gray-600 mb-6">
              Vos données sont conservées pendant la durée de votre utilisation de nos services,
              puis pendant les durées légales de conservation applicables. Les données clients
              sont conservées selon vos paramètres et instructions.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Vos droits</h2>
            <p className="text-gray-600 mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification des données inexactes</li>
              <li>Droit à l'effacement (« droit à l'oubli »)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d'opposition au traitement</li>
              <li>Droit de retirer votre consentement à tout moment</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Sécurité des données</h2>
            <p className="text-gray-600 mb-6">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger
              vos données : chiffrement SSL/TLS, contrôle d'accès, sauvegardes régulières, formation du personnel.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Transferts internationaux</h2>
            <p className="text-gray-600 mb-6">
              Vos données sont hébergées au sein de l'Union Européenne. En cas de transfert hors UE,
              nous veillons à ce que des garanties appropriées soient mises en place (clauses contractuelles types, etc.).
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact</h2>
            <p className="text-gray-600 mb-6">
              Pour toute question concernant cette politique ou pour exercer vos droits, contactez notre
              Délégué à la Protection des Données :
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <p className="text-gray-700"><strong>Email :</strong> dpo@qualee.fr</p>
              <p className="text-gray-700"><strong>Adresse :</strong> Qualee - DPO, 123 Rue de la Beauté, 75001 Paris</p>
            </div>

            <p className="text-gray-600">
              Vous pouvez également introduire une réclamation auprès de la CNIL (Commission Nationale
              de l'Informatique et des Libertés) si vous estimez que vos droits ne sont pas respectés.
            </p>
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
