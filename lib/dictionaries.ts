// Dictionnaire FR / HE. Le hébreu a été traduit avec soin mais mérite une relecture
// par un locuteur natif avant mise en avant publique (formulations, nuances).
export type Locale = "fr" | "he";
export const LOCALES: Locale[] = ["fr", "he"];
export const DEFAULT_LOCALE: Locale = "fr";

export function otherLocale(locale: Locale): Locale {
  return locale === "fr" ? "he" : "fr";
}

interface LieuOption {
  id: string;
  label: string;
}

interface Dictionary {
  dir: "ltr" | "rtl";
  siteName: string;
  nav: {
    connexion: string;
    reserver: string;
    retourAccueil: string;
    dejaInscrit: string;
    monCompte: (nom: string) => string;
  };
  home: {
    badge: string;
    titre1: string;
    titre2: string;
    sousTitre: string;
    ctaReserver: string;
    aProposLabel: string;
    aProposTitre: string;
    langues: string;
    parcours: string[];
    atouts: { titre: string; texte: string }[];
    tarifsLabel: string;
    tarifsTitre: string;
    niveaux: { titre: string; detail: string; prix: string }[];
    parHeure: string;
    tarifsNote: string;
    zoneLabel: string;
    zoneTexte: string;
    ctaFinalTitre: string;
    ctaFinalTexte: string;
  };
  reserver: {
    titre: string;
    sousTitre: string;
    chargement: string;
    aucunCreneau: string;
    creneauChoisi: (jour: string, heure: string) => string;
    changerCreneau: string;
    prefilNote: string;
    champNom: string;
    champTelephone: string;
    champEmail: string;
    champNiveau: string;
    champNiveauSelect: string;
    champLieu: string;
    champAdresse: string;
    champAdressePlaceholder: string;
    champDigicode: string;
    champDigicodePlaceholder: string;
    champMessage: string;
    champMessagePlaceholder: string;
    boutonConfirmer: string;
    boutonEnvoi: string;
    lieux: LieuOption[];
    niveaux: string[];
    confirmeTitre: string;
    confirmeTexte: (jour: string, heure: string) => string;
    retourAccueil: string;
    erreurGenerique: string;
    erreurCreneaux: string;
    compteProposeTitre: string;
    compteProposeTexte: string;
    compteBoutonCreer: string;
    compteIgnorer: string;
    compteEnvoye: string;
  };
  connexion: {
    titre: string;
    sousTitre: string;
    envoyeTitre: string;
    envoyeTexte: (email: string) => string;
    champEmail: string;
    erreur: string;
    bouton: string;
    boutonEnvoi: string;
    note: string;
  };
  monCompte: {
    titre: string;
    chargement: string;
    nonConnecte: string;
    seConnecter: string;
    bienvenue: string;
    connecteEnTantQue: (email: string) => string;
    champNom: string;
    champTelephone: string;
    champNiveau: string;
    champAdresse: string;
    champDigicode: string;
    lieuPrefereLabel: string;
    lieux: LieuOption[];
    boutonEnregistrer: string;
    boutonEnregistrement: string;
    messageSucces: string;
    messageErreur: string;
    seDeconnecter: string;
  };
}

const fr: Dictionary = {
  dir: "ltr",
  siteName: "Shiour Gavriel",
  nav: {
    connexion: "Connexion",
    reserver: "Réserver un cours",
    retourAccueil: "← Retour à l'accueil",
    dejaInscrit: "Déjà inscrit ? Se connecter",
    monCompte: (nom) => `Mon compte (${nom})`,
  },
  home: {
    badge: "Cours particuliers · Collège & Lycée",
    titre1: "Cours particuliers",
    titre2: "de mathématiques",
    sousTitre:
      "Réussir les maths, pas à pas. Tous niveaux, de la 5ème à la Terminale — à domicile ou par Zoom.",
    ctaReserver: "Réserver un créneau →",
    aProposLabel: "À propos de Gabriel",
    aProposTitre: "Un professeur expérimenté dans le système scolaire israélien",
    langues: "Langues d'enseignement : français, hébreu.",
    parcours: [
      "Professeur titulaire du ministère de l'Éducation israélien (Misrad HaHinoukh), enseignant en collège et lycée",
      "Titulaire d'un master en mathématiques (Toar Chéni) et d'un master en gestion",
      "A enseigné en France, en collège et en lycée",
      "Titulaire de la Teoudat Horaa israélienne",
      "Spécialiste de l'accompagnement en mathématiques des olim hadashim francophones",
    ],
    atouts: [
      { titre: "Méthode personnalisée", texte: "Adaptée au niveau et au rythme de chaque élève." },
      { titre: "Progression suivie", texte: "Suivi et amélioration continue à chaque séance." },
      { titre: "Résultats concrets", texte: "Des progrès visibles, pas juste des promesses." },
      { titre: "Accompagnement bienveillant", texte: "À l'écoute, motivant, sans pression inutile." },
    ],
    tarifsLabel: "Tarifs",
    tarifsTitre: "Simple et transparent",
    niveaux: [
      { titre: "Collège", detail: "de la 5ème à la 3ème", prix: "90 ₪" },
      { titre: "Lycée", detail: "de la 2nde à la 1ère", prix: "100 ₪" },
      { titre: "Terminale / Bac", detail: "préparation au baccalauréat", prix: "110 ₪" },
    ],
    parHeure: "/ heure",
    tarifsNote:
      "À domicile ou par Zoom. Paiement réglé directement avec l'élève ou le parent, hors réservation en ligne.",
    zoneLabel: "Zone couverte",
    zoneTexte: "Hadera · Natanya · Raanana — à domicile ou par Zoom",
    ctaFinalTitre: "Prêt à réserver votre premier cours ?",
    ctaFinalTexte: "Choisissez un créneau disponible dans l'agenda et réservez en quelques secondes.",
  },
  reserver: {
    titre: "Réserver un cours",
    sousTitre: "Choisissez un créneau disponible dans l'agenda de Gabriel.",
    chargement: "Chargement des créneaux disponibles…",
    aucunCreneau: "Aucun créneau disponible pour le moment. Contactez Gabriel directement au",
    creneauChoisi: (jour, heure) => `Créneau choisi : ${jour} à ${heure}`,
    changerCreneau: "Changer de créneau",
    prefilNote: "Vos informations sont pré-remplies depuis votre profil — modifiez-les si besoin.",
    champNom: "Nom de l'élève / du parent *",
    champTelephone: "Téléphone *",
    champEmail: "Email *",
    champNiveau: "Niveau scolaire *",
    champNiveauSelect: "Sélectionner…",
    champLieu: "Lieu du cours *",
    champAdresse: "Adresse *",
    champAdressePlaceholder: "Rue, numéro, ville",
    champDigicode: "Digicode / instructions d'accès",
    champDigicodePlaceholder: "Code d'entrée, étage…",
    champMessage: "Message (optionnel)",
    champMessagePlaceholder: "Sujet à travailler, urgence, précisions…",
    boutonConfirmer: "Confirmer la réservation →",
    boutonEnvoi: "Réservation en cours…",
    lieux: [
      { id: "eleve", label: "Chez l'élève" },
      { id: "prof", label: "Chez le professeur" },
      { id: "zoom", label: "Par Zoom" },
    ],
    niveaux: ["6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale", "Autre"],
    confirmeTitre: "Réservation confirmée !",
    confirmeTexte: (jour, heure) =>
      `Votre cours est réservé le ${jour} à ${heure}. Un e-mail de confirmation vous a été envoyé.`,
    retourAccueil: "Retour à l'accueil",
    erreurGenerique: "La réservation a échoué. Réessayez ou contactez Gabriel au 053 45 08 171.",
    erreurCreneaux:
      "Impossible de charger les créneaux disponibles pour le moment. Contactez directement Gabriel au 053 45 08 171.",
    compteProposeTitre: "Créer un compte pour la prochaine fois ?",
    compteProposeTexte: "Vous n'aurez plus à ressaisir votre adresse, digicode et niveau aux prochaines réservations.",
    compteBoutonCreer: "Créer mon compte →",
    compteIgnorer: "Non merci, je ne réserve qu'un seul cours",
    compteEnvoye: "Un lien de connexion vous a été envoyé par e-mail pour activer votre compte.",
  },
  connexion: {
    titre: "Se connecter",
    sousTitre: "Entrez votre e-mail, vous recevrez un lien de connexion — pas de mot de passe à retenir.",
    envoyeTitre: "E-mail envoyé !",
    envoyeTexte: (email) => `Ouvrez votre boîte mail (${email}) et cliquez sur le lien reçu pour vous connecter.`,
    champEmail: "E-mail",
    erreur: "L'envoi a échoué. Réessayez, ou réservez sans compte au 053 45 08 171.",
    bouton: "Recevoir mon lien de connexion →",
    boutonEnvoi: "Envoi en cours…",
    note: "Pas encore de compte ? Il sera créé automatiquement à la première connexion.",
  },
  monCompte: {
    titre: "Mon compte",
    chargement: "Chargement…",
    nonConnecte: "Vous n'êtes pas connecté(e).",
    seConnecter: "Se connecter",
    bienvenue:
      "Bienvenue ! Complétez votre profil ci-dessous pour ne plus avoir à ressaisir vos informations lors des prochaines réservations.",
    connecteEnTantQue: (email) => `Connecté(e) en tant que ${email}`,
    champNom: "Nom *",
    champTelephone: "Téléphone",
    champNiveau: "Niveau scolaire",
    champAdresse: "Adresse (pour les cours à domicile)",
    champDigicode: "Digicode / instructions d'accès",
    lieuPrefereLabel: "Lieu préféré",
    lieux: [
      { id: "eleve", label: "Chez l'élève" },
      { id: "prof", label: "Chez le professeur" },
      { id: "zoom", label: "Par Zoom" },
    ],
    boutonEnregistrer: "Enregistrer",
    boutonEnregistrement: "Enregistrement…",
    messageSucces: "Profil enregistré.",
    messageErreur: "Erreur lors de l'enregistrement. Réessayez.",
    seDeconnecter: "Se déconnecter",
  },
};

const he: Dictionary = {
  dir: "rtl",
  siteName: "שיעור גבריאל",
  nav: {
    connexion: "התחברות",
    reserver: "קביעת שיעור",
    retourAccueil: "→ חזרה לדף הבית",
    dejaInscrit: "כבר רשומים? התחברות",
    monCompte: (nom) => `החשבון שלי (${nom})`,
  },
  home: {
    badge: "שיעורים פרטיים · חטיבת ביניים ותיכון",
    titre1: "שיעורים פרטיים",
    titre2: "במתמטיקה",
    sousTitre: "להצליח במתמטיקה, צעד אחר צעד. לכל הרמות, מכיתה ה' עד כיתה י\"ב — בבית התלמיד או בזום.",
    ctaReserver: "קביעת שיעור ←",
    aProposLabel: "אודות גבריאל",
    aProposTitre: "מורה מנוסה במערכת החינוך הישראלית",
    langues: "שפות הוראה: צרפתית, עברית.",
    parcours: [
      "מורה קבוע במשרד החינוך הישראלי, מלמד בחטיבת ביניים ובתיכון",
      "בעל תואר שני (M.Sc) במתמטיקה ותואר שני בניהול",
      "לימד בצרפת, בחטיבת ביניים ובתיכון",
      "בעל תעודת הוראה ישראלית",
      "מומחה בליווי עולים חדשים דוברי צרפתית במתמטיקה",
    ],
    atouts: [
      { titre: "שיטה מותאמת אישית", texte: "מותאמת לרמה ולקצב של כל תלמיד/ה." },
      { titre: "התקדמות מובטחת", texte: "מעקב ושיפור מתמשך בכל שיעור." },
      { titre: "תוצאות מוחשיות", texte: "התקדמות שרואים, לא רק הבטחות." },
      { titre: "ליווי אישי ותומך", texte: "הקשבה, עידוד, בלי לחץ מיותר." },
    ],
    tarifsLabel: "מחירים",
    tarifsTitre: "פשוט ושקוף",
    niveaux: [
      { titre: "חטיבת ביניים", detail: "כיתה ה' עד כיתה ט'", prix: "90 ₪" },
      { titre: "תיכון", detail: "כיתה י' עד כיתה י\"ב", prix: "100 ₪" },
    ],
    parHeure: "/ שעה",
    tarifsNote: "בבית התלמיד או בזום. התשלום מתבצע ישירות מול התלמיד/ה או ההורה, מחוץ להזמנה המקוונת.",
    zoneLabel: "אזור השירות",
    zoneTexte: "חדרה · נתניה · רעננה — בבית התלמיד או בזום",
    ctaFinalTitre: "מוכנים לקבוע את השיעור הראשון?",
    ctaFinalTexte: "בחרו מועד פנוי ביומן וקבעו שיעור תוך שניות.",
  },
  reserver: {
    titre: "קביעת שיעור",
    sousTitre: "בחרו מועד פנוי ביומן של גבריאל.",
    chargement: "טוען את המועדים הפנויים…",
    aucunCreneau: "אין כרגע מועדים פנויים. צרו קשר ישירות עם גבריאל בטלפון",
    creneauChoisi: (jour, heure) => `המועד שנבחר: ${jour} בשעה ${heure}`,
    changerCreneau: "שינוי מועד",
    prefilNote: "הפרטים שלכם מולאו אוטומטית מהפרופיל — אפשר לערוך במידת הצורך.",
    champNom: "שם התלמיד/ה או ההורה *",
    champTelephone: "טלפון *",
    champEmail: "אימייל *",
    champNiveau: "כיתה *",
    champNiveauSelect: "בחרו…",
    champLieu: "מקום השיעור *",
    champAdresse: "כתובת *",
    champAdressePlaceholder: "רחוב, מספר, עיר",
    champDigicode: "קוד כניסה / הנחיות גישה",
    champDigicodePlaceholder: "קוד כניסה, קומה…",
    champMessage: "הודעה (לא חובה)",
    champMessagePlaceholder: "נושא לעבודה, דחיפות, פרטים נוספים…",
    boutonConfirmer: "אישור ההזמנה ←",
    boutonEnvoi: "ההזמנה מתבצעת…",
    lieux: [
      { id: "eleve", label: "בבית התלמיד" },
      { id: "prof", label: "אצל המורה" },
      { id: "zoom", label: "בזום" },
    ],
    niveaux: ["ו'", "ז'", "ח'", "ט'", "י'", "יא'", "יב'", "אחר"],
    confirmeTitre: "ההזמנה אושרה!",
    confirmeTexte: (jour, heure) => `השיעור נקבע ל-${jour} בשעה ${heure}. נשלח אליכם אימייל אישור.`,
    retourAccueil: "חזרה לדף הבית",
    erreurGenerique: "ההזמנה נכשלה. נסו שוב או צרו קשר עם גבריאל בטלפון 053 45 08 171.",
    erreurCreneaux: "לא ניתן לטעון את המועדים הפנויים כרגע. צרו קשר ישירות עם גבריאל בטלפון 053 45 08 171.",
    compteProposeTitre: "ליצור חשבון לפעם הבאה?",
    compteProposeTexte: "לא תצטרכו להזין שוב את הכתובת, קוד הכניסה והכיתה בהזמנות הבאות.",
    compteBoutonCreer: "יצירת חשבון ←",
    compteIgnorer: "לא תודה, אני מזמין/ה שיעור בודד בלבד",
    compteEnvoye: "נשלח אליכם קישור התחברות באימייל להפעלת החשבון.",
  },
  connexion: {
    titre: "התחברות",
    sousTitre: "הזינו את כתובת האימייל שלכם, תקבלו קישור התחברות — בלי צורך בסיסמה.",
    envoyeTitre: "האימייל נשלח!",
    envoyeTexte: (email) => `פתחו את תיבת הדואר שלכם (${email}) ולחצו על הקישור שקיבלתם כדי להתחבר.`,
    champEmail: "אימייל",
    erreur: "השליחה נכשלה. נסו שוב, או קבעו שיעור בלי חשבון בטלפון 053 45 08 171.",
    bouton: "שליחת קישור התחברות ←",
    boutonEnvoi: "שולח…",
    note: "עדיין אין לכם חשבון? הוא ייווצר אוטומטית בהתחברות הראשונה.",
  },
  monCompte: {
    titre: "החשבון שלי",
    chargement: "טוען…",
    nonConnecte: "אינכם מחוברים.",
    seConnecter: "התחברות",
    bienvenue: "ברוכים הבאים! השלימו את הפרופיל למטה כדי לא להזין שוב את הפרטים שלכם בהזמנות הבאות.",
    connecteEnTantQue: (email) => `מחובר/ת בתור ${email}`,
    champNom: "שם *",
    champTelephone: "טלפון",
    champNiveau: "כיתה",
    champAdresse: "כתובת (לשיעורים בבית)",
    champDigicode: "קוד כניסה / הנחיות גישה",
    lieuPrefereLabel: "מקום מועדף",
    lieux: [
      { id: "eleve", label: "בבית התלמיד" },
      { id: "prof", label: "אצל המורה" },
      { id: "zoom", label: "בזום" },
    ],
    boutonEnregistrer: "שמירה",
    boutonEnregistrement: "שומר…",
    messageSucces: "הפרופיל נשמר.",
    messageErreur: "שגיאה בשמירה. נסו שוב.",
    seDeconnecter: "התנתקות",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { fr, he };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
