'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-[#4a4a52] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#4a4a52]/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-bold">CGU & Reglement</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/10">
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-8 text-center">
            CONDITIONS GENERALES D'UTILISATION – SOLUTION QUALEE
          </h1>

          {/* Article 1 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-amber-400 mb-4">Article 1 – Organisation et Contexte</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              La societe WEANI (ci-apres la « Societe Organisatrice »), SAS, au capital de 1 000€, immatriculee au RCS de Bordeaux sous le numero 904 049 301 dont le siege social est situe au 9 rue de Conde, 33000 Bordeaux, edite et commercialise la solution logicielle QUALEE.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              La solution QUALEE permet a des commerces independants (salons de coiffure, instituts de beaute, barbiers, etc., ci-apres les « Etablissements Partenaires ») d'animer leur point de vente en proposant a leurs clients (ci-apres les « Participants ») un programme de fidelite digital et un jeu ludique de type "Roue de la Fortune".
            </p>
            <p className="text-gray-300 leading-relaxed">
              Il est expressement entendu que le role de la Societe Organisatrice (Weani) se limite a la fourniture de la solution technique (SaaS). L'Etablissement Partenaire demeure le seul organisateur du jeu et du programme de fidelite au sein de son commerce.
            </p>
          </section>

          {/* Article 2 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-amber-400 mb-4">Article 2 – Modalites de participation</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              La participation au Jeu et au programme de fidelite est reservee aux clients physiques de l'Etablissement Partenaire disposant d'un smartphone et d'un numero de telephone valide (compatible WhatsApp).
            </p>
            <p className="text-gray-300 leading-relaxed mb-2">Pour participer, le Participant est invite a :</p>
            <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
              <li>Scanner le QR Code unique mis a disposition dans l'Etablissement Partenaire.</li>
              <li>Suivre le parcours digital a l'ecran (qui peut inclure le depot d'un avis ou une note de satisfaction).</li>
              <li>Renseigner son numero de telephone pour recevoir ses gains et sa carte de fidelite.</li>
              <li>Lancer la "Roue" virtuelle.</li>
            </ol>
          </section>

          {/* Article 3 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-amber-400 mb-4">Article 3 – Dotation et Gains</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              La dotation du Jeu consiste en un avantage (remise en pourcentage, produit offert, points de fidelite) offert par l'Etablissement Partenaire.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li>La nature des lots, le stock mis en jeu, ainsi que les conditions de validite (duree, minimum d'achat) sont definis exclusivement par l'Etablissement Partenaire via son interface de gestion QUALEE.</li>
              <li>L'Etablissement Partenaire est libre de modifier les lots a tout moment.</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              Il est precise que la Societe Organisatrice (Weani) n'intervient aucunement dans la determination des dotations. Des lors, la responsabilite de Weani ne saurait etre recherchee en cas d'indisponibilite d'un lot ou de refus de l'Etablissement d'honorer un gain.
            </p>
          </section>

          {/* Article 4 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-amber-400 mb-4">Article 4 – Designation des gagnants</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Les resultats sont determines instantanement par un algorithme aleatoire parametre par l'Etablissement Partenaire (taux de chance, nombre de gagnants par jour).
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Le resultat s'affiche immediatement sur l'ecran du smartphone du Participant.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Le gain est ensuite confirme par l'envoi d'une notification (via WhatsApp) contenant un recapitulatif ou un lien vers la carte de fidelite digitale.
            </p>
            <p className="text-gray-300 leading-relaxed">
              En cas de dysfonctionnement du reseau internet ou de la plateforme de messagerie (WhatsApp), la Societe Organisatrice ne pourra etre tenue responsable de la non-reception de la notification.
            </p>
          </section>

          {/* Article 5 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-amber-400 mb-4">Article 5 – Conditions de participation et Fraude</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              L'inscription au Jeu implique l'acceptation sans reserve du present reglement.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              La participation est strictement nominative. Il est rigoureusement interdit pour un Participant de jouer sous plusieurs identites ou d'utiliser des numeros de telephone temporaires/frauduleux pour cumuler indument des gains.
            </p>
            <p className="text-gray-300 leading-relaxed">
              L'Etablissement Partenaire se reserve le droit de refuser un gain s'il soupconne une tentative de fraude ou une manipulation du systeme.
            </p>
          </section>

          {/* Article 6 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-amber-400 mb-4">Article 6 – Remise des dotations</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Pour beneficier de son gain ou utiliser ses points de fidelite, le Participant devra presenter son QR code de confirmation au personnel de l'Etablissement Partenaire lors de son passage en caisse.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              L'Etablissement Partenaire pourra valider l'utilisation du gain directement sur sa propre interface.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Les gains ne sont ni echangeables, ni remboursables, ni convertibles en especes.
            </p>
          </section>

          {/* Article 7 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-amber-400 mb-4">Article 7 – Donnees personnelles (RGPD)</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Dans le cadre de l'utilisation de la solution QUALEE, des donnees personnelles sont collectees (notamment le numero de telephone, le nom, le prenom et l'historique des visites/avis).
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li><strong className="text-white">Responsable de traitement :</strong> L'Etablissement Partenaire est le Responsable de Traitement des donnees de ses clients.</li>
              <li><strong className="text-white">Sous-traitant :</strong> La societe Weani agit en qualite de sous-traitant technique pour le stockage et la gestion securisee de ces donnees.</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mb-2">Les donnees sont utilisees pour :</p>
            <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li>La gestion du compte de fidelite et l'attribution des gains.</li>
              <li>L'envoi de notifications transactionnelles (confirmation de points, recompenses).</li>
              <li>L'envoi d'offres promotionnelles par l'Etablissement (si le client a donne son accord).</li>
            </ol>
            <p className="text-gray-300 leading-relaxed">
              Conformement a la reglementation (RGPD), le Participant dispose d'un droit d'acces, de rectification et de suppression de ses donnees. Pour exercer ce droit, le Participant doit s'adresser directement a l'Etablissement Partenaire.
            </p>
          </section>

          {/* Article 8 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-amber-400 mb-4">Article 8 – Propriete intellectuelle</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              La societe Weani est seule titulaire de l'ensemble des droits de propriete intellectuelle relatifs a la solution QUALEE (logiciel, design de la roue, code source, logos Qualee).
            </p>
            <p className="text-gray-300 leading-relaxed">
              L'utilisation du service ne confere au Participant aucun droit de propriete sur ces elements. Toute reproduction ou ingenierie inverse est strictement interdite.
            </p>
          </section>

          {/* Article 9 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-amber-400 mb-4">Article 9 – Responsabilite Technique</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              La Societe Organisatrice (Weani) s'engage a faire ses meilleurs efforts pour assurer la disponibilite du service. Toutefois, sa responsabilite ne saurait etre engagee en cas de :
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Panne du reseau Internet ou telephonique du Participant ou de l'Etablissement.</li>
              <li>Dysfonctionnement des services tiers (Google, WhatsApp, Meta).</li>
              <li>Mauvaise configuration des offres par l'Etablissement Partenaire.</li>
            </ul>
          </section>

          {/* Article 10 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-amber-400 mb-4">Article 10 – Loi applicable et juridiction</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Les presentes CGU sont soumises a la loi francaise.
            </p>
            <p className="text-gray-300 leading-relaxed">
              En cas de litige, et apres tentative de resolution amiable, competence expresse est attribuee aux tribunaux competents du ressort du siege social de la societe Weani.
            </p>
          </section>

          {/* Footer info */}
          <div className="mt-12 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              WEANI SAS - 9 rue de Conde, 33000 Bordeaux
            </p>
            <p className="text-gray-400 text-sm">
              RCS Bordeaux 904 049 301
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
