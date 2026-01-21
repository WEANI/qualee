'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Menu, X } from 'lucide-react';

export default function CGUPage() {
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
              <Link href="/landing#fonctionnement" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Comment ca marche</Link>
              <Link href="/landing#fonctionnalites" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Fonctionnalites</Link>
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
              <Link href="/landing#fonctionnement" className="text-gray-600 hover:text-[#EB1E99] transition-colors py-2">Comment ca marche</Link>
              <Link href="/landing#fonctionnalites" className="text-gray-600 hover:text-[#EB1E99] transition-colors py-2">Fonctionnalites</Link>
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
            <span className="text-[#7209B7] text-sm font-medium">Mentions legales</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            CGU &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
              Reglement
            </span>
          </h1>

          <p className="text-gray-600">
            Solution QUALEE - Conditions Generales d'Utilisation
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            {/* Article 1 */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 1 – Organisation et Contexte</h2>
            <p className="text-gray-600 mb-4">
              La societe WEANI (ci-apres la « Societe Organisatrice »), SAS, au capital de 1 000€, immatriculee au RCS de Bordeaux sous le numero 904 049 301 dont le siege social est situe au 9 rue de Conde, 33000 Bordeaux, edite et commercialise la solution logicielle QUALEE.
            </p>
            <p className="text-gray-600 mb-4">
              La solution QUALEE permet a des commerces independants (salons de coiffure, instituts de beaute, barbiers, etc., ci-apres les « Etablissements Partenaires ») d'animer leur point de vente en proposant a leurs clients (ci-apres les « Participants ») un programme de fidelite digital et un jeu ludique de type "Roue de la Fortune".
            </p>
            <p className="text-gray-600 mb-6">
              Il est expressement entendu que le role de la Societe Organisatrice (Weani) se limite a la fourniture de la solution technique (SaaS). L'Etablissement Partenaire demeure le seul organisateur du jeu et du programme de fidelite au sein de son commerce.
            </p>

            {/* Article 2 */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 2 – Modalites de participation</h2>
            <p className="text-gray-600 mb-4">
              La participation au Jeu et au programme de fidelite est reservee aux clients physiques de l'Etablissement Partenaire disposant d'un smartphone et d'un numero de telephone valide (compatible WhatsApp).
            </p>
            <p className="text-gray-600 mb-4">Pour participer, le Participant est invite a :</p>
            <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
              <li>Scanner le QR Code unique mis a disposition dans l'Etablissement Partenaire.</li>
              <li>Suivre le parcours digital a l'ecran (qui peut inclure le depot d'un avis ou une note de satisfaction).</li>
              <li>Renseigner son numero de telephone pour recevoir ses gains et sa carte de fidelite.</li>
              <li>Lancer la "Roue" virtuelle.</li>
            </ol>

            {/* Article 3 */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 3 – Dotation et Gains</h2>
            <p className="text-gray-600 mb-4">
              La dotation du Jeu consiste en un avantage (remise en pourcentage, produit offert, points de fidelite) offert par l'Etablissement Partenaire.
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>La nature des lots, le stock mis en jeu, ainsi que les conditions de validite (duree, minimum d'achat) sont definis exclusivement par l'Etablissement Partenaire via son interface de gestion QUALEE.</li>
              <li>L'Etablissement Partenaire est libre de modifier les lots a tout moment.</li>
            </ul>
            <p className="text-gray-600 mb-6">
              Il est precise que la Societe Organisatrice (Weani) n'intervient aucunement dans la determination des dotations. Des lors, la responsabilite de Weani ne saurait etre recherchee en cas d'indisponibilite d'un lot ou de refus de l'Etablissement d'honorer un gain.
            </p>

            {/* Article 4 */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 4 – Designation des gagnants</h2>
            <p className="text-gray-600 mb-4">
              Les resultats sont determines instantanement par un algorithme aleatoire parametre par l'Etablissement Partenaire (taux de chance, nombre de gagnants par jour).
            </p>
            <p className="text-gray-600 mb-4">
              Le resultat s'affiche immediatement sur l'ecran du smartphone du Participant.
            </p>
            <p className="text-gray-600 mb-4">
              Le gain est ensuite confirme par l'envoi d'une notification (via WhatsApp) contenant un recapitulatif ou un lien vers la carte de fidelite digitale.
            </p>
            <p className="text-gray-600 mb-6">
              En cas de dysfonctionnement du reseau internet ou de la plateforme de messagerie (WhatsApp), la Societe Organisatrice ne pourra etre tenue responsable de la non-reception de la notification.
            </p>

            {/* Article 5 */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 5 – Conditions de participation et Fraude</h2>
            <p className="text-gray-600 mb-4">
              L'inscription au Jeu implique l'acceptation sans reserve du present reglement.
            </p>
            <p className="text-gray-600 mb-4">
              La participation est strictement nominative. Il est rigoureusement interdit pour un Participant de jouer sous plusieurs identites ou d'utiliser des numeros de telephone temporaires/frauduleux pour cumuler indument des gains.
            </p>
            <p className="text-gray-600 mb-6">
              L'Etablissement Partenaire se reserve le droit de refuser un gain s'il soupconne une tentative de fraude ou une manipulation du systeme.
            </p>

            {/* Article 6 */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 6 – Remise des dotations</h2>
            <p className="text-gray-600 mb-4">
              Pour beneficier de son gain ou utiliser ses points de fidelite, le Participant devra presenter son QR code de confirmation au personnel de l'Etablissement Partenaire lors de son passage en caisse.
            </p>
            <p className="text-gray-600 mb-4">
              L'Etablissement Partenaire pourra valider l'utilisation du gain directement sur sa propre interface.
            </p>
            <p className="text-gray-600 mb-6">
              Les gains ne sont ni echangeables, ni remboursables, ni convertibles en especes.
            </p>

            {/* Article 7 */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 7 – Donnees personnelles (RGPD)</h2>
            <p className="text-gray-600 mb-4">
              Dans le cadre de l'utilisation de la solution QUALEE, des donnees personnelles sont collectees (notamment le numero de telephone, le nom, le prenom et l'historique des visites/avis).
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li><strong className="text-gray-900">Responsable de traitement :</strong> L'Etablissement Partenaire est le Responsable de Traitement des donnees de ses clients.</li>
              <li><strong className="text-gray-900">Sous-traitant :</strong> La societe Weani agit en qualite de sous-traitant technique pour le stockage et la gestion securisee de ces donnees.</li>
            </ul>
            <p className="text-gray-600 mb-4">Les donnees sont utilisees pour :</p>
            <ol className="list-decimal list-inside text-gray-600 mb-4 space-y-2">
              <li>La gestion du compte de fidelite et l'attribution des gains.</li>
              <li>L'envoi de notifications transactionnelles (confirmation de points, recompenses).</li>
              <li>L'envoi d'offres promotionnelles par l'Etablissement (si le client a donne son accord).</li>
            </ol>
            <p className="text-gray-600 mb-6">
              Conformement a la reglementation (RGPD), le Participant dispose d'un droit d'acces, de rectification et de suppression de ses donnees. Pour exercer ce droit, le Participant doit s'adresser directement a l'Etablissement Partenaire.
            </p>

            {/* Article 8 */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 8 – Propriete intellectuelle</h2>
            <p className="text-gray-600 mb-4">
              La societe Weani est seule titulaire de l'ensemble des droits de propriete intellectuelle relatifs a la solution QUALEE (logiciel, design de la roue, code source, logos Qualee).
            </p>
            <p className="text-gray-600 mb-6">
              L'utilisation du service ne confere au Participant aucun droit de propriete sur ces elements. Toute reproduction ou ingenierie inverse est strictement interdite.
            </p>

            {/* Article 9 */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 9 – Responsabilite Technique</h2>
            <p className="text-gray-600 mb-4">
              La Societe Organisatrice (Weani) s'engage a faire ses meilleurs efforts pour assurer la disponibilite du service. Toutefois, sa responsabilite ne saurait etre engagee en cas de :
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Panne du reseau Internet ou telephonique du Participant ou de l'Etablissement.</li>
              <li>Dysfonctionnement des services tiers (Google, WhatsApp, Meta).</li>
              <li>Mauvaise configuration des offres par l'Etablissement Partenaire.</li>
            </ul>

            {/* Article 10 */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 10 – Loi applicable et juridiction</h2>
            <p className="text-gray-600 mb-4">
              Les presentes CGU sont soumises a la loi francaise.
            </p>
            <p className="text-gray-600 mb-6">
              En cas de litige, et apres tentative de resolution amiable, competence expresse est attribuee aux tribunaux competents du ressort du siege social de la societe Weani.
            </p>

            {/* Footer info */}
            <div className="bg-gray-50 rounded-2xl p-6 mt-12">
              <p className="text-gray-700"><strong>WEANI SAS</strong></p>
              <p className="text-gray-700">9 rue de Conde, 33000 Bordeaux</p>
              <p className="text-gray-700">RCS Bordeaux 904 049 301</p>
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
                La solution de fidelisation client nouvelle generation pour les professionnels de la beaute.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Produit</h4>
              <ul className="space-y-3">
                <li><Link href="/landing#fonctionnement" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Comment ca marche</Link></li>
                <li><Link href="/landing#fonctionnalites" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Fonctionnalites</Link></li>
                <li><Link href="/landing#tarifs" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Tarifs</Link></li>
                <li><Link href="/landing#faq" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Entreprise</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">A propos</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Contact</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Blog</Link></li>
                <li><Link href="/careers" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Carrieres</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Politique de confidentialite</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Conditions d'utilisation</Link></li>
                <li><Link href="/cookies" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Cookies</Link></li>
                <li><Link href="/gdpr" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">RGPD</Link></li>
                <li><Link href="/cgu" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">CGU & Reglement</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Qualee. Tous droits reserves.</p>
            <p className="text-gray-500 text-sm">Fait avec amour pour les professionnels de la beaute</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
