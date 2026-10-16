import {type Locale, localeNumberingSystem} from "@/i18n/locales";

const en = {
  foundation: "Foundation route",
  contentRequired: "CONTENT REQUIRED",
  about: "About",
  contact: "Contact",
  faq: "FAQ",
  faqTitle: "Frequently asked questions",
  help: "Help",
  news: "News",
  search: "Search",
  engravings: "Engravings",
  humanHandprint: "Human Handprint",
  humanityChooses: "Humanity Chooses",
  goldenLeaves: "Golden Leaves",
  story: "Story",
  menu: "Menu",
  primaryNavigation: "Primary navigation",
  editorialRepository: "Editorial repository contract",
  editorialRoute: "Editorial route contract",
  aboutDescription: "Tree of Unity page content placeholder.",
  contactDescription:
    "The accessible form structure is available for Figma mapping, but no delivery endpoint or fake submission behavior exists.",
  submissionNotConfigured: "SUBMISSION NOT CONFIGURED",
  contactForm: "Contact form structure",
  name: "Name",
  email: "Email",
  contactReason: "Reason for contact",
  message: "Message",
  submissionUnavailable: "Submission unavailable",
  faqDescription:
    "The accordion behavior is accessible and presentation-neutral. Approved questions and answers remain content work.",
  helpDescription:
    "Approved support tasks and content have not been supplied. This is a reusable semantic route shell.",
  newsDescription:
    "Editorial data is represented by safe structured blocks. Raw HTML rendering is not part of this foundation.",
  workingFixtures: "Working fixtures",
  articleTitle: "[WORKING COPY] Foundation update",
  articleExcerpt: "[WORKING COPY] Technical foundation update.",
  articleDescription:
    "Working content fixture for the editorial route contract.",
  articleNotFound: "Article not found",
  searchDescription:
    "Search input is bounded and currently reads deterministic local editorial fixtures only.",
  searchFieldDescription:
    "Search is limited to 120 characters. Results use local fixtures in this foundation.",
  searchLabel: "Search Tree of Unity",
  searchError: "Enter between 1 and 120 characters.",
  results: "Results",
  noResults: "No results",
  noResultsMessage: "No local fixture matched this query.",
  engravingsDescription:
    "This route reserves an accessible content path for the five approved engraving-zone identifiers without implementing geometry or selection.",
  stableIdentifiers: "Stable domain identifiers",
  handprintDescription:
    "The domain is intentionally limited to a coming-soon state. No simulated controls or false functionality are present.",
  comingSoon: "COMING SOON",
  humanityDescription:
    "This domain remains separate from Golden Leaf ownership and does not implement voting. The physical mapping of its 50 leaves is not known and has not been fabricated.",
  approvedBoundary: "Approved contract boundary",
  leafCount: "{count} leaves",
  apexExcluded:
    "Apex leaf #1000 is excluded. Voting is not bound to a physical leaf.",
  storyTitle: "A shared place for human stories",
  storyIntro:
    "Tree of Unity is a planned five-metre bronze sculpture with 1,000 handmade gold leaves. The design brings together individual dedications, inscriptions on the trunk, and a single handprint at its base.",
  storyDedications:
    "Each leaf is conceived as a dedication to a person, a brand or an organisation. Names, messages and dedications form part of the design of the bronze trunk.",
  storyVisualisations:
    "The tree has not yet been built. The scenes on this website are project visualisations.",
  returnTree: "Return to the tree",
  conditionsOfSale: "Conditions of Sale",
  cookies: "Cookie Policy",
  privacy: "Privacy Policy",
  terms: "Terms of Use",
  legalNotFound: "Legal document not found",
  legalDescription:
    "[LEGAL COPY REQUIRED] This template reserves semantic document structure only and is not legal advice or approved policy text.",
  legalTemplate: "Legal document template",
  legalRequired: "LEGAL COPY REQUIRED",
  leafTitle: "Golden Leaf #{number}",
  leafNotFound: "Golden Leaf not found",
  leafDescription:
    "This template proves canonical identity, validation, and provider-independent lookup. Approved editorial content and final presentation are not available.",
  leafRoute: "Golden Leaf route contract",
  typedRecord: "Typed record",
  canonicalNumber: "Canonical number",
  category: "Category",
  pendingMapping: "Pending approved physical mapping",
  status: "Status",
  notSpecified: "Not specified",
  standard: "Standard",
  apex: "Apex",
  reserved: "Reserved",
  errorHeading: "Something went wrong",
  retry: "Try again",
  errorMessage:
    "The page could not be completed. No diagnostic or stack information is shown here.",
  errorTitle: "Application error",
  notFoundHeading: "Page not found",
  returnHome: "Return to the home route",
  notFoundMessage:
    "The requested route or record does not exist in this foundation.",
  notFoundTitle: "Not found",
} as const;

export type EditorialMessages = { readonly [Key in keyof typeof en]: string };

const es: EditorialMessages = {
  foundation: "Ruta base",
  contentRequired: "CONTENIDO REQUERIDO",
  about: "Acerca de",
  contact: "Contacto",
  faq: "Preguntas frecuentes",
  faqTitle: "Preguntas frecuentes",
  help: "Ayuda",
  news: "Noticias",
  search: "Buscar",
  engravings: "Grabados",
  humanHandprint: "Huella humana",
  humanityChooses: "La humanidad elige",
  goldenLeaves: "Hojas doradas",
  story: "Historia",
  menu: "Menú",
  primaryNavigation: "Navegación principal",
  editorialRepository: "Contrato del repositorio editorial",
  editorialRoute: "Contrato de la ruta editorial",
  aboutDescription: "Marcador de contenido de la página de Tree of Unity.",
  contactDescription:
    "La estructura accesible del formulario está disponible para su correspondencia en Figma, pero no hay un punto de envío ni un comportamiento de envío simulado.",
  submissionNotConfigured: "ENVÍO SIN CONFIGURAR",
  contactForm: "Estructura del formulario de contacto",
  name: "Nombre",
  email: "Correo electrónico",
  contactReason: "Motivo de contacto",
  message: "Mensaje",
  submissionUnavailable: "Envío no disponible",
  faqDescription:
    "El acordeón es accesible y no impone una presentación visual. Las preguntas y respuestas aprobadas siguen pendientes de redacción.",
  helpDescription:
    "No se han proporcionado tareas de soporte ni contenido aprobados. Esta es una estructura semántica de ruta reutilizable.",
  newsDescription:
    "Los datos editoriales se representan mediante bloques estructurados seguros. Esta base no incluye la representación de HTML sin procesar.",
  workingFixtures: "Datos de ejemplo provisionales",
  articleTitle: "[TEXTO PROVISIONAL] Actualización de la base",
  articleExcerpt: "[TEXTO PROVISIONAL] Actualización de la base técnica.",
  articleDescription:
    "Datos de contenido provisionales para el contrato de la ruta editorial.",
  articleNotFound: "Artículo no encontrado",
  searchDescription:
    "La búsqueda tiene una longitud limitada y actualmente solo consulta datos editoriales locales de ejemplo y deterministas.",
  searchFieldDescription:
    "La búsqueda está limitada a 120 caracteres. Los resultados utilizan datos de ejemplo locales de esta base.",
  searchLabel: "Buscar en Tree of Unity",
  searchError: "Introduce entre 1 y 120 caracteres.",
  results: "Resultados",
  noResults: "Sin resultados",
  noResultsMessage: "Ningún dato de ejemplo local coincide con esta consulta.",
  engravingsDescription:
    "Esta ruta reserva un acceso al contenido accesible para los cinco identificadores de zonas de grabado aprobados, sin implementar geometría ni selección.",
  stableIdentifiers: "Identificadores de dominio estables",
  handprintDescription:
    "El dominio se limita intencionadamente a un estado de próxima disponibilidad. No hay controles simulados ni funciones ficticias.",
  comingSoon: "PRÓXIMAMENTE",
  humanityDescription:
    "Este dominio permanece separado de la titularidad de las hojas doradas y no implementa votaciones. Se desconoce la correspondencia física de sus 50 hojas y no se ha inventado.",
  approvedBoundary: "Límite del contrato aprobado",
  leafCount: "{count} hojas",
  apexExcluded:
    "La hoja de la cima n.º 1000 está excluida. La votación no está vinculada a una hoja física.",
  storyTitle: "Un lugar compartido para las historias humanas",
  storyIntro:
    "Tree of Unity es una escultura de bronce proyectada de cinco metros, con 1.000 hojas de oro hechas a mano. El diseño reúne dedicatorias individuales, inscripciones en el tronco y una única huella de mano en su base.",
  storyDedications:
    "Cada hoja se concibe como una dedicatoria a una persona, una marca o una organización. Los nombres, mensajes y dedicatorias forman parte del diseño del tronco de bronce.",
  storyVisualisations:
    "El árbol aún no se ha construido. Las escenas de este sitio web son visualizaciones del proyecto.",
  returnTree: "Volver al árbol",
  conditionsOfSale: "Condiciones de venta",
  cookies: "Política de cookies",
  privacy: "Política de privacidad",
  terms: "Condiciones de uso",
  legalNotFound: "Documento legal no encontrado",
  legalDescription:
    "[TEXTO LEGAL REQUERIDO] Esta plantilla solo reserva la estructura semántica del documento; no constituye asesoramiento jurídico ni una política aprobada.",
  legalTemplate: "Plantilla de documento legal",
  legalRequired: "TEXTO LEGAL REQUERIDO",
  leafTitle: "Hoja dorada n.º {number}",
  leafNotFound: "Hoja dorada no encontrada",
  leafDescription:
    "Esta plantilla demuestra la identidad canónica, la validación y la búsqueda independiente del proveedor. El contenido editorial aprobado y la presentación final no están disponibles.",
  leafRoute: "Contrato de la ruta de hoja dorada",
  typedRecord: "Registro tipado",
  canonicalNumber: "Número canónico",
  category: "Categoría",
  pendingMapping: "Pendiente de correspondencia física aprobada",
  status: "Estado",
  notSpecified: "Sin especificar",
  standard: "Estándar",
  apex: "Cima",
  reserved: "Reservada",
  errorHeading: "Algo ha fallado",
  retry: "Volver a intentar",
  errorMessage:
    "No se ha podido completar la página. Aquí no se muestra información de diagnóstico ni de la pila de ejecución.",
  errorTitle: "Error de la aplicación",
  notFoundHeading: "Página no encontrada",
  returnHome: "Volver a la página de inicio",
  notFoundMessage: "La ruta o el registro solicitado no existe en esta base.",
  notFoundTitle: "No encontrado",
};

const fr: EditorialMessages = {
  foundation: "Page de base",
  contentRequired: "CONTENU REQUIS",
  about: "À propos",
  contact: "Contact",
  faq: "FAQ",
  faqTitle: "Questions fréquentes",
  help: "Aide",
  news: "Actualités",
  search: "Rechercher",
  engravings: "Gravures",
  humanHandprint: "Empreinte humaine",
  humanityChooses: "L’humanité choisit",
  goldenLeaves: "Feuilles d’or",
  story: "Histoire",
  menu: "Menu",
  primaryNavigation: "Navigation principale",
  editorialRepository: "Contrat du dépôt éditorial",
  editorialRoute: "Contrat de la page éditoriale",
  aboutDescription: "Contenu provisoire de la page Tree of Unity.",
  contactDescription:
    "La structure accessible du formulaire est disponible pour la correspondance avec Figma, mais aucun service d’envoi ni comportement d’envoi simulé n’existe.",
  submissionNotConfigured: "ENVOI NON CONFIGURÉ",
  contactForm: "Structure du formulaire de contact",
  name: "Nom",
  email: "E-mail",
  contactReason: "Motif du contact",
  message: "Message",
  submissionUnavailable: "Envoi indisponible",
  faqDescription:
    "L’accordéon est accessible et indépendant de la présentation. Les questions et réponses approuvées restent à rédiger.",
  helpDescription:
    "Aucune tâche d’assistance ni aucun contenu approuvé n’a été fourni. Il s’agit d’une structure sémantique de page réutilisable.",
  newsDescription:
    "Les données éditoriales sont représentées par des blocs structurés sûrs. Cette base n’inclut pas le rendu de HTML brut.",
  workingFixtures: "Données d’exemple provisoires",
  articleTitle: "[TEXTE PROVISOIRE] Mise à jour de la base",
  articleExcerpt: "[TEXTE PROVISOIRE] Mise à jour de la base technique.",
  articleDescription:
    "Données de contenu provisoires pour le contrat de la page éditoriale.",
  articleNotFound: "Article introuvable",
  searchDescription:
    "La saisie de recherche est limitée et ne consulte actuellement que des données éditoriales d’exemple locales et déterministes.",
  searchFieldDescription:
    "La recherche est limitée à 120 caractères. Les résultats utilisent les données d’exemple locales de cette base.",
  searchLabel: "Rechercher dans Tree of Unity",
  searchError: "Saisissez entre 1 et 120 caractères.",
  results: "Résultats",
  noResults: "Aucun résultat",
  noResultsMessage:
    "Aucune donnée d’exemple locale ne correspond à cette recherche.",
  engravingsDescription:
    "Cette page réserve un accès au contenu accessible pour les cinq identifiants de zones de gravure approuvés, sans implémenter de géométrie ni de sélection.",
  stableIdentifiers: "Identifiants de domaine stables",
  handprintDescription:
    "Ce domaine est volontairement limité à un état de disponibilité prochaine. Aucun contrôle simulé ni aucune fonctionnalité fictive n’est présent.",
  comingSoon: "BIENTÔT DISPONIBLE",
  humanityDescription:
    "Ce domaine reste distinct de la propriété des feuilles d’or et n’implémente pas de vote. La correspondance physique de ses 50 feuilles est inconnue et n’a pas été inventée.",
  approvedBoundary: "Périmètre du contrat approuvé",
  leafCount: "{count} feuilles",
  apexExcluded:
    "La feuille au sommet n° 1000 est exclue. Le vote n’est pas lié à une feuille physique.",
  storyTitle: "Un lieu commun pour les histoires humaines",
  storyIntro:
    "Tree of Unity est un projet de sculpture en bronze de cinq mètres, ornée de 1 000 feuilles d’or faites à la main. Le dessin réunit des dédicaces individuelles, des inscriptions sur le tronc et une empreinte de main unique à sa base.",
  storyDedications:
    "Chaque feuille est conçue comme une dédicace à une personne, une marque ou une organisation. Les noms, messages et dédicaces font partie du dessin du tronc en bronze.",
  storyVisualisations:
    "L’arbre n’a pas encore été construit. Les scènes de ce site sont des visualisations du projet.",
  returnTree: "Revenir à l’arbre",
  conditionsOfSale: "Conditions de vente",
  cookies: "Politique relative aux cookies",
  privacy: "Politique de confidentialité",
  terms: "Conditions d’utilisation",
  legalNotFound: "Document juridique introuvable",
  legalDescription:
    "[TEXTE JURIDIQUE REQUIS] Ce modèle réserve uniquement une structure sémantique de document et ne constitue ni un conseil juridique ni une politique approuvée.",
  legalTemplate: "Modèle de document juridique",
  legalRequired: "TEXTE JURIDIQUE REQUIS",
  leafTitle: "Feuille d’or n° {number}",
  leafNotFound: "Feuille d’or introuvable",
  leafDescription:
    "Ce modèle démontre l’identité canonique, la validation et la recherche indépendante du fournisseur. Le contenu éditorial approuvé et la présentation finale ne sont pas disponibles.",
  leafRoute: "Contrat de la page de feuille d’or",
  typedRecord: "Enregistrement typé",
  canonicalNumber: "Numéro canonique",
  category: "Catégorie",
  pendingMapping: "En attente d’une correspondance physique approuvée",
  status: "Statut",
  notSpecified: "Non précisé",
  standard: "Standard",
  apex: "Sommet",
  reserved: "Réservée",
  errorHeading: "Un problème est survenu",
  retry: "Réessayer",
  errorMessage:
    "La page n’a pas pu être finalisée. Aucune information de diagnostic ou de pile d’exécution n’est affichée ici.",
  errorTitle: "Erreur de l’application",
  notFoundHeading: "Page introuvable",
  returnHome: "Revenir à la page d’accueil",
  notFoundMessage:
    "La page ou l’enregistrement demandé n’existe pas dans cette base.",
  notFoundTitle: "Introuvable",
};

const de: EditorialMessages = {
  foundation: "Grundlegende Route",
  contentRequired: "INHALT ERFORDERLICH",
  about: "Über uns",
  contact: "Kontakt",
  faq: "FAQ",
  faqTitle: "Häufig gestellte Fragen",
  help: "Hilfe",
  news: "Neuigkeiten",
  search: "Suchen",
  engravings: "Gravuren",
  humanHandprint: "Menschlicher Handabdruck",
  humanityChooses: "Die Menschheit entscheidet",
  goldenLeaves: "Goldene Blätter",
  story: "Geschichte",
  menu: "Menü",
  primaryNavigation: "Hauptnavigation",
  editorialRepository: "Vertrag des redaktionellen Repositorys",
  editorialRoute: "Vertrag der redaktionellen Route",
  aboutDescription: "Platzhalter für den Seiteninhalt von Tree of Unity.",
  contactDescription:
    "Die barrierefreie Formularstruktur steht für die Zuordnung in Figma bereit. Es gibt jedoch weder einen Versandendpunkt noch einen simulierten Versand.",
  submissionNotConfigured: "VERSAND NICHT KONFIGURIERT",
  contactForm: "Struktur des Kontaktformulars",
  name: "Name",
  email: "E-Mail",
  contactReason: "Kontaktgrund",
  message: "Nachricht",
  submissionUnavailable: "Versand nicht verfügbar",
  faqDescription:
    "Das Akkordeon ist barrierefrei und unabhängig von der Darstellung. Freigegebene Fragen und Antworten müssen noch erstellt werden.",
  helpDescription:
    "Freigegebene Supportaufgaben und Inhalte wurden noch nicht bereitgestellt. Dies ist ein wiederverwendbares semantisches Seitengerüst.",
  newsDescription:
    "Redaktionelle Daten werden durch sichere strukturierte Blöcke dargestellt. Die Darstellung von unverarbeitetem HTML gehört nicht zu dieser Grundlage.",
  workingFixtures: "Vorläufige Beispieldaten",
  articleTitle: "[ARBEITSFASSUNG] Aktualisierung der Grundlage",
  articleExcerpt: "[ARBEITSFASSUNG] Aktualisierung der technischen Grundlage.",
  articleDescription:
    "Vorläufige Inhaltsdaten für den Vertrag der redaktionellen Route.",
  articleNotFound: "Artikel nicht gefunden",
  searchDescription:
    "Die Sucheingabe ist begrenzt und durchsucht derzeit ausschließlich deterministische lokale redaktionelle Beispieldaten.",
  searchFieldDescription:
    "Die Suche ist auf 120 Zeichen begrenzt. Die Ergebnisse verwenden lokale Beispieldaten dieser Grundlage.",
  searchLabel: "Tree of Unity durchsuchen",
  searchError: "Gib zwischen 1 und 120 Zeichen ein.",
  results: "Ergebnisse",
  noResults: "Keine Ergebnisse",
  noResultsMessage:
    "Keine lokalen Beispieldaten stimmen mit dieser Suche überein.",
  engravingsDescription:
    "Diese Route reserviert einen barrierefreien Inhaltspfad für die fünf freigegebenen Kennungen der Gravurzonen, ohne Geometrie oder Auswahl umzusetzen.",
  stableIdentifiers: "Stabile Domänenkennungen",
  handprintDescription:
    "Diese Domäne ist bewusst auf einen Ankündigungsstatus beschränkt. Es gibt keine simulierten Bedienelemente oder vorgetäuschten Funktionen.",
  comingSoon: "DEMNÄCHST",
  humanityDescription:
    "Diese Domäne bleibt vom Eigentum an goldenen Blättern getrennt und enthält keine Abstimmungsfunktion. Die physische Zuordnung ihrer 50 Blätter ist unbekannt und wurde nicht erfunden.",
  approvedBoundary: "Grenze des freigegebenen Vertrags",
  leafCount: "{count} Blätter",
  apexExcluded:
    "Das oberste Blatt Nr. 1000 ist ausgeschlossen. Die Abstimmung ist nicht an ein physisches Blatt gebunden.",
  storyTitle: "Ein gemeinsamer Ort für menschliche Geschichten",
  storyIntro:
    "Tree of Unity ist eine geplante, fünf Meter hohe Bronzeskulptur mit 1.000 handgefertigten Goldblättern. Der Entwurf vereint individuelle Widmungen, Inschriften am Stamm und einen einzelnen Handabdruck an der Basis.",
  storyDedications:
    "Jedes Blatt ist als Widmung an eine Person, eine Marke oder eine Organisation gedacht. Namen, Botschaften und Widmungen sind Teil der Gestaltung des Bronzestamms.",
  storyVisualisations:
    "Der Baum wurde noch nicht gebaut. Die Szenen auf dieser Website sind Visualisierungen des Projekts.",
  returnTree: "Zurück zum Baum",
  conditionsOfSale: "Verkaufsbedingungen",
  cookies: "Cookie-Richtlinie",
  privacy: "Datenschutzrichtlinie",
  terms: "Nutzungsbedingungen",
  legalNotFound: "Rechtliches Dokument nicht gefunden",
  legalDescription:
    "[RECHTSTEXT ERFORDERLICH] Diese Vorlage reserviert lediglich die semantische Dokumentstruktur und ist weder Rechtsberatung noch ein freigegebener Richtlinientext.",
  legalTemplate: "Vorlage für ein rechtliches Dokument",
  legalRequired: "RECHTSTEXT ERFORDERLICH",
  leafTitle: "Goldenes Blatt Nr. {number}",
  leafNotFound: "Goldenes Blatt nicht gefunden",
  leafDescription:
    "Diese Vorlage demonstriert kanonische Identität, Validierung und anbieterunabhängige Suche. Freigegebene redaktionelle Inhalte und die endgültige Darstellung sind nicht verfügbar.",
  leafRoute: "Vertrag der Route für goldene Blätter",
  typedRecord: "Typisierter Datensatz",
  canonicalNumber: "Kanonische Nummer",
  category: "Kategorie",
  pendingMapping: "Freigegebene physische Zuordnung ausstehend",
  status: "Status",
  notSpecified: "Nicht angegeben",
  standard: "Standard",
  apex: "Spitze",
  reserved: "Reserviert",
  errorHeading: "Etwas ist schiefgelaufen",
  retry: "Erneut versuchen",
  errorMessage:
    "Die Seite konnte nicht fertiggestellt werden. Hier werden keine Diagnose- oder Stackinformationen angezeigt.",
  errorTitle: "Anwendungsfehler",
  notFoundHeading: "Seite nicht gefunden",
  returnHome: "Zur Startseite",
  notFoundMessage:
    "Die angeforderte Route oder der Datensatz existiert in dieser Grundlage nicht.",
  notFoundTitle: "Nicht gefunden",
};

const it: EditorialMessages = {
  foundation: "Percorso di base",
  contentRequired: "CONTENUTO RICHIESTO",
  about: "Informazioni",
  contact: "Contatti",
  faq: "FAQ",
  faqTitle: "Domande frequenti",
  help: "Aiuto",
  news: "Notizie",
  search: "Cerca",
  engravings: "Incisioni",
  humanHandprint: "Impronta umana",
  humanityChooses: "L’umanità sceglie",
  goldenLeaves: "Foglie d’oro",
  story: "Storia",
  menu: "Menu",
  primaryNavigation: "Navigazione principale",
  editorialRepository: "Contratto del repository editoriale",
  editorialRoute: "Contratto del percorso editoriale",
  aboutDescription: "Segnaposto del contenuto della pagina di Tree of Unity.",
  contactDescription:
    "La struttura accessibile del modulo è disponibile per la corrispondenza in Figma, ma non esistono un endpoint di invio o un invio simulato.",
  submissionNotConfigured: "INVIO NON CONFIGURATO",
  contactForm: "Struttura del modulo di contatto",
  name: "Nome",
  email: "E-mail",
  contactReason: "Motivo del contatto",
  message: "Messaggio",
  submissionUnavailable: "Invio non disponibile",
  faqDescription:
    "La fisarmonica è accessibile e indipendente dalla presentazione. Le domande e risposte approvate restano da redigere.",
  helpDescription:
    "Non sono state fornite attività di assistenza né contenuti approvati. Questa è una struttura semantica di pagina riutilizzabile.",
  newsDescription:
    "I dati editoriali sono rappresentati da blocchi strutturati sicuri. Questa base non prevede il rendering di HTML grezzo.",
  workingFixtures: "Dati di esempio provvisori",
  articleTitle: "[TESTO PROVVISORIO] Aggiornamento della base",
  articleExcerpt: "[TESTO PROVVISORIO] Aggiornamento della base tecnica.",
  articleDescription:
    "Dati di contenuto provvisori per il contratto del percorso editoriale.",
  articleNotFound: "Articolo non trovato",
  searchDescription:
    "La ricerca ha una lunghezza limitata e consulta attualmente solo dati editoriali di esempio locali e deterministici.",
  searchFieldDescription:
    "La ricerca è limitata a 120 caratteri. I risultati usano i dati di esempio locali di questa base.",
  searchLabel: "Cerca in Tree of Unity",
  searchError: "Inserisci da 1 a 120 caratteri.",
  results: "Risultati",
  noResults: "Nessun risultato",
  noResultsMessage:
    "Nessun dato di esempio locale corrisponde a questa ricerca.",
  engravingsDescription:
    "Questo percorso riserva un accesso al contenuto accessibile per i cinque identificatori delle zone di incisione approvati, senza implementare geometria o selezione.",
  stableIdentifiers: "Identificatori di dominio stabili",
  handprintDescription:
    "Il dominio è volutamente limitato a uno stato di prossima disponibilità. Non sono presenti controlli simulati o funzionalità fittizie.",
  comingSoon: "PROSSIMAMENTE",
  humanityDescription:
    "Questo dominio resta separato dalla proprietà delle foglie d’oro e non implementa votazioni. La corrispondenza fisica delle sue 50 foglie non è nota e non è stata inventata.",
  approvedBoundary: "Limite del contratto approvato",
  leafCount: "{count} foglie",
  apexExcluded:
    "La foglia apicale n. 1000 è esclusa. Il voto non è legato a una foglia fisica.",
  storyTitle: "Un luogo condiviso per le storie umane",
  storyIntro:
    "Tree of Unity è una scultura in bronzo progettata di cinque metri, con 1.000 foglie d’oro fatte a mano. Il progetto unisce dediche individuali, iscrizioni sul tronco e una sola impronta di mano alla base.",
  storyDedications:
    "Ogni foglia è concepita come dedica a una persona, un marchio o un’organizzazione. Nomi, messaggi e dediche fanno parte del disegno del tronco in bronzo.",
  storyVisualisations:
    "L’albero non è ancora stato costruito. Le scene di questo sito sono visualizzazioni del progetto.",
  returnTree: "Torna all’albero",
  conditionsOfSale: "Condizioni di vendita",
  cookies: "Informativa sui cookie",
  privacy: "Informativa sulla privacy",
  terms: "Condizioni d’uso",
  legalNotFound: "Documento legale non trovato",
  legalDescription:
    "[TESTO LEGALE RICHIESTO] Questo modello riserva solo la struttura semantica del documento e non costituisce consulenza legale o un testo normativo approvato.",
  legalTemplate: "Modello di documento legale",
  legalRequired: "TESTO LEGALE RICHIESTO",
  leafTitle: "Foglia d’oro n. {number}",
  leafNotFound: "Foglia d’oro non trovata",
  leafDescription:
    "Questo modello dimostra identità canonica, validazione e ricerca indipendente dal fornitore. I contenuti editoriali approvati e la presentazione finale non sono disponibili.",
  leafRoute: "Contratto del percorso della foglia d’oro",
  typedRecord: "Record tipizzato",
  canonicalNumber: "Numero canonico",
  category: "Categoria",
  pendingMapping: "In attesa della corrispondenza fisica approvata",
  status: "Stato",
  notSpecified: "Non specificato",
  standard: "Standard",
  apex: "Apice",
  reserved: "Riservata",
  errorHeading: "Si è verificato un problema",
  retry: "Riprova",
  errorMessage:
    "Non è stato possibile completare la pagina. Qui non vengono mostrate informazioni diagnostiche o dello stack.",
  errorTitle: "Errore dell’applicazione",
  notFoundHeading: "Pagina non trovata",
  returnHome: "Torna alla pagina iniziale",
  notFoundMessage:
    "Il percorso o il record richiesto non esiste in questa base.",
  notFoundTitle: "Non trovato",
};

const ptBR: EditorialMessages = {
  foundation: "Rota de base",
  contentRequired: "CONTEÚDO NECESSÁRIO",
  about: "Sobre",
  contact: "Contato",
  faq: "Perguntas frequentes",
  faqTitle: "Perguntas frequentes",
  help: "Ajuda",
  news: "Notícias",
  search: "Pesquisar",
  engravings: "Gravações",
  humanHandprint: "Marca da mão humana",
  humanityChooses: "A humanidade escolhe",
  goldenLeaves: "Folhas de ouro",
  story: "História",
  menu: "Menu",
  primaryNavigation: "Navegação principal",
  editorialRepository: "Contrato do repositório editorial",
  editorialRoute: "Contrato da rota editorial",
  aboutDescription:
    "Espaço reservado para o conteúdo da página do Tree of Unity.",
  contactDescription:
    "A estrutura acessível do formulário está disponível para correspondência no Figma, mas não há endpoint de envio nem envio simulado.",
  submissionNotConfigured: "ENVIO NÃO CONFIGURADO",
  contactForm: "Estrutura do formulário de contato",
  name: "Nome",
  email: "E-mail",
  contactReason: "Motivo do contato",
  message: "Mensagem",
  submissionUnavailable: "Envio indisponível",
  faqDescription:
    "O acordeão é acessível e independente da apresentação visual. As perguntas e respostas aprovadas ainda precisam ser redigidas.",
  helpDescription:
    "Não foram fornecidas tarefas de suporte nem conteúdo aprovados. Esta é uma estrutura semântica de rota reutilizável.",
  newsDescription:
    "Os dados editoriais são representados por blocos estruturados seguros. Esta base não inclui a renderização de HTML bruto.",
  workingFixtures: "Dados de exemplo provisórios",
  articleTitle: "[TEXTO PROVISÓRIO] Atualização da base",
  articleExcerpt: "[TEXTO PROVISÓRIO] Atualização da base técnica.",
  articleDescription:
    "Dados de conteúdo provisórios para o contrato da rota editorial.",
  articleNotFound: "Artigo não encontrado",
  searchDescription:
    "A entrada de pesquisa tem tamanho limitado e atualmente consulta apenas dados editoriais locais de exemplo e determinísticos.",
  searchFieldDescription:
    "A pesquisa é limitada a 120 caracteres. Os resultados usam dados de exemplo locais desta base.",
  searchLabel: "Pesquisar no Tree of Unity",
  searchError: "Digite entre 1 e 120 caracteres.",
  results: "Resultados",
  noResults: "Nenhum resultado",
  noResultsMessage: "Nenhum dado de exemplo local corresponde a esta pesquisa.",
  engravingsDescription:
    "Esta rota reserva um caminho de conteúdo acessível para os cinco identificadores de zonas de gravação aprovados, sem implementar geometria ou seleção.",
  stableIdentifiers: "Identificadores de domínio estáveis",
  handprintDescription:
    "O domínio é intencionalmente limitado a um estado de disponibilidade futura. Não há controles simulados nem funcionalidades fictícias.",
  comingSoon: "EM BREVE",
  humanityDescription:
    "Este domínio permanece separado da propriedade das folhas de ouro e não implementa votação. A correspondência física das suas 50 folhas é desconhecida e não foi inventada.",
  approvedBoundary: "Limite do contrato aprovado",
  leafCount: "{count} folhas",
  apexExcluded:
    "A folha do topo nº 1000 está excluída. A votação não está vinculada a uma folha física.",
  storyTitle: "Um lugar compartilhado para histórias humanas",
  storyIntro:
    "Tree of Unity é uma escultura de bronze planejada de cinco metros, com 1.000 folhas de ouro feitas à mão. O projeto reúne dedicatórias individuais, inscrições no tronco e uma única marca de mão na base.",
  storyDedications:
    "Cada folha é concebida como uma dedicatória a uma pessoa, uma marca ou uma organização. Nomes, mensagens e dedicatórias fazem parte do desenho do tronco de bronze.",
  storyVisualisations:
    "A árvore ainda não foi construída. As cenas deste site são visualizações do projeto.",
  returnTree: "Voltar à árvore",
  conditionsOfSale: "Condições de venda",
  cookies: "Política de cookies",
  privacy: "Política de privacidade",
  terms: "Termos de uso",
  legalNotFound: "Documento jurídico não encontrado",
  legalDescription:
    "[TEXTO JURÍDICO NECESSÁRIO] Este modelo reserva apenas a estrutura semântica do documento e não constitui aconselhamento jurídico nem texto de política aprovado.",
  legalTemplate: "Modelo de documento jurídico",
  legalRequired: "TEXTO JURÍDICO NECESSÁRIO",
  leafTitle: "Folha de ouro nº {number}",
  leafNotFound: "Folha de ouro não encontrada",
  leafDescription:
    "Este modelo demonstra identidade canônica, validação e consulta independente do provedor. O conteúdo editorial aprovado e a apresentação final não estão disponíveis.",
  leafRoute: "Contrato da rota de folha de ouro",
  typedRecord: "Registro tipado",
  canonicalNumber: "Número canônico",
  category: "Categoria",
  pendingMapping: "Aguardando correspondência física aprovada",
  status: "Status",
  notSpecified: "Não especificado",
  standard: "Padrão",
  apex: "Topo",
  reserved: "Reservada",
  errorHeading: "Algo deu errado",
  retry: "Tentar novamente",
  errorMessage:
    "Não foi possível concluir a página. Nenhuma informação de diagnóstico ou de pilha de execução é exibida aqui.",
  errorTitle: "Erro da aplicação",
  notFoundHeading: "Página não encontrada",
  returnHome: "Voltar à página inicial",
  notFoundMessage: "A rota ou o registro solicitado não existe nesta base.",
  notFoundTitle: "Não encontrado",
};

const zhHans: EditorialMessages = {
  foundation: "基础路由",
  contentRequired: "需要内容",
  about: "关于",
  contact: "联系",
  faq: "常见问题",
  faqTitle: "常见问题",
  help: "帮助",
  news: "新闻",
  search: "搜索",
  engravings: "铭刻",
  humanHandprint: "人类手印",
  humanityChooses: "人类的选择",
  goldenLeaves: "金叶",
  story: "故事",
  menu: "菜单",
  primaryNavigation: "主导航",
  editorialRepository: "编辑内容仓库契约",
  editorialRoute: "编辑内容路由契约",
  aboutDescription: "Tree of Unity 页面内容占位符。",
  contactDescription:
    "无障碍表单结构已可供 Figma 映射使用，但尚无提交端点，也不存在模拟提交行为。",
  submissionNotConfigured: "尚未配置提交",
  contactForm: "联系表单结构",
  name: "姓名",
  email: "电子邮箱",
  contactReason: "联系事由",
  message: "留言",
  submissionUnavailable: "暂不可提交",
  faqDescription:
    "折叠面板具备无障碍功能，且不限定展示样式。经批准的问题与答案仍待编写。",
  helpDescription:
    "尚未提供经批准的支持任务和内容。这是可复用的语义化路由框架。",
  newsDescription:
    "编辑数据使用安全的结构化内容块表示。本基础框架不包含原始 HTML 渲染。",
  workingFixtures: "临时示例数据",
  articleTitle: "[临时文案] 基础框架更新",
  articleExcerpt: "[临时文案] 技术基础框架更新。",
  articleDescription: "用于编辑内容路由契约的临时示例内容。",
  articleNotFound: "未找到文章",
  searchDescription: "搜索输入有长度限制，目前仅查询确定性的本地编辑示例数据。",
  searchFieldDescription:
    "搜索最多为 120 个字符。结果来自本基础框架的本地示例数据。",
  searchLabel: "搜索 Tree of Unity",
  searchError: "请输入 1 至 120 个字符。",
  results: "搜索结果",
  noResults: "无搜索结果",
  noResultsMessage: "没有本地示例数据与此查询匹配。",
  engravingsDescription:
    "此路由为五个经批准的铭刻区域标识符保留了无障碍内容路径，尚未实现几何形状或选择功能。",
  stableIdentifiers: "稳定的领域标识符",
  handprintDescription:
    "此领域有意限定为即将推出状态。不存在模拟控件或虚假功能。",
  comingSoon: "即将推出",
  humanityDescription:
    "此领域与金叶所有权保持独立，尚未实现投票功能。其 50 片叶子的物理映射尚不明确，也未被虚构。",
  approvedBoundary: "经批准的契约边界",
  leafCount: "{count} 片叶子",
  apexExcluded: "不包含顶部的 1000 号叶子。投票不与任何实体叶子绑定。",
  storyTitle: "共享人类故事的地方",
  storyIntro:
    "Tree of Unity 是一座规划中的五米高青铜雕塑，配有 1,000 片手工金叶。设计融合了个人献词、树干铭文以及底座上的一个手印。",
  storyDedications:
    "每片叶子都被构想为献给一个人、一个品牌或一个组织的致意。姓名、留言和献词构成青铜树干设计的一部分。",
  storyVisualisations: "这棵树尚未建成。本网站中的场景是项目的可视化展示。",
  returnTree: "返回树景",
  conditionsOfSale: "销售条款",
  cookies: "Cookie 政策",
  privacy: "隐私政策",
  terms: "使用条款",
  legalNotFound: "未找到法律文件",
  legalDescription:
    "[需要法律文案] 此模板仅保留语义化文件结构，不构成法律建议或经批准的政策文本。",
  legalTemplate: "法律文件模板",
  legalRequired: "需要法律文案",
  leafTitle: "金叶 {number} 号",
  leafNotFound: "未找到金叶",
  leafDescription:
    "此模板用于验证规范身份、校验及独立于提供方的查询。经批准的编辑内容和最终展示尚不可用。",
  leafRoute: "金叶路由契约",
  typedRecord: "类型化记录",
  canonicalNumber: "规范编号",
  category: "类别",
  pendingMapping: "等待经批准的物理映射",
  status: "状态",
  notSpecified: "未指定",
  standard: "标准",
  apex: "顶部",
  reserved: "已预留",
  errorHeading: "出现了问题",
  retry: "重试",
  errorMessage: "无法完成此页面。此处不显示诊断或堆栈信息。",
  errorTitle: "应用程序错误",
  notFoundHeading: "未找到页面",
  returnHome: "返回首页",
  notFoundMessage: "本基础框架中不存在所请求的路由或记录。",
  notFoundTitle: "未找到",
};

const zhHant: EditorialMessages = {
  foundation: "基礎路由",
  contentRequired: "需要內容",
  about: "關於",
  contact: "聯絡",
  faq: "常見問題",
  faqTitle: "常見問題",
  help: "說明",
  news: "新聞",
  search: "搜尋",
  engravings: "銘刻",
  humanHandprint: "人類手印",
  humanityChooses: "人類的選擇",
  goldenLeaves: "金葉",
  story: "故事",
  menu: "選單",
  primaryNavigation: "主要導覽",
  editorialRepository: "編輯內容儲存庫契約",
  editorialRoute: "編輯內容路由契約",
  aboutDescription: "Tree of Unity 頁面內容預留位置。",
  contactDescription:
    "無障礙表單結構已可供 Figma 對應使用，但尚無提交端點，也不存在模擬提交行為。",
  submissionNotConfigured: "尚未設定提交",
  contactForm: "聯絡表單結構",
  name: "姓名",
  email: "電子郵件",
  contactReason: "聯絡事由",
  message: "訊息",
  submissionUnavailable: "暫無法提交",
  faqDescription:
    "摺疊面板具備無障礙功能，且不限定呈現樣式。經核准的問題與答案仍待編寫。",
  helpDescription:
    "尚未提供經核准的支援任務和內容。這是可重複使用的語意化路由架構。",
  newsDescription:
    "編輯資料使用安全的結構化內容區塊表示。本基礎架構不包含原始 HTML 轉譯。",
  workingFixtures: "暫用範例資料",
  articleTitle: "[暫用文案] 基礎架構更新",
  articleExcerpt: "[暫用文案] 技術基礎架構更新。",
  articleDescription: "用於編輯內容路由契約的暫用範例內容。",
  articleNotFound: "找不到文章",
  searchDescription: "搜尋輸入有長度限制，目前僅查詢確定性的本機編輯範例資料。",
  searchFieldDescription:
    "搜尋最多為 120 個字元。結果來自本基礎架構的本機範例資料。",
  searchLabel: "搜尋 Tree of Unity",
  searchError: "請輸入 1 至 120 個字元。",
  results: "搜尋結果",
  noResults: "沒有搜尋結果",
  noResultsMessage: "沒有本機範例資料符合此查詢。",
  engravingsDescription:
    "此路由為五個經核准的銘刻區域識別碼保留了無障礙內容路徑，尚未實作幾何形狀或選取功能。",
  stableIdentifiers: "穩定的領域識別碼",
  handprintDescription:
    "此領域刻意限定為即將推出狀態。不存在模擬控制項或虛假功能。",
  comingSoon: "即將推出",
  humanityDescription:
    "此領域與金葉所有權保持獨立，尚未實作投票功能。其 50 片葉子的實體對應尚不明確，也未被虛構。",
  approvedBoundary: "經核准的契約邊界",
  leafCount: "{count} 片葉子",
  apexExcluded: "不包含頂部的 1000 號葉子。投票不與任何實體葉子綁定。",
  storyTitle: "共享人類故事的地方",
  storyIntro:
    "Tree of Unity 是一座規劃中的五公尺高青銅雕塑，配有 1,000 片手工金葉。設計融合了個人獻詞、樹幹銘文以及底座上的一個手印。",
  storyDedications:
    "每片葉子都被構想為獻給一個人、一個品牌或一個組織的致意。姓名、訊息和獻詞構成青銅樹幹設計的一部分。",
  storyVisualisations: "這棵樹尚未建成。本網站中的場景是專案的視覺化呈現。",
  returnTree: "返回樹景",
  conditionsOfSale: "銷售條款",
  cookies: "Cookie 政策",
  privacy: "隱私權政策",
  terms: "使用條款",
  legalNotFound: "找不到法律文件",
  legalDescription:
    "[需要法律文案] 此範本僅保留語意化文件結構，不構成法律建議或經核准的政策文字。",
  legalTemplate: "法律文件範本",
  legalRequired: "需要法律文案",
  leafTitle: "金葉 {number} 號",
  leafNotFound: "找不到金葉",
  leafDescription:
    "此範本用於驗證標準身分、驗證程序及獨立於提供者的查詢。經核准的編輯內容和最終呈現尚不可用。",
  leafRoute: "金葉路由契約",
  typedRecord: "具型別的記錄",
  canonicalNumber: "標準編號",
  category: "類別",
  pendingMapping: "等待經核准的實體對應",
  status: "狀態",
  notSpecified: "未指定",
  standard: "標準",
  apex: "頂部",
  reserved: "已預留",
  errorHeading: "發生問題",
  retry: "重試",
  errorMessage: "無法完成此頁面。此處不顯示診斷或堆疊資訊。",
  errorTitle: "應用程式錯誤",
  notFoundHeading: "找不到頁面",
  returnHome: "返回首頁",
  notFoundMessage: "本基礎架構中不存在所要求的路由或記錄。",
  notFoundTitle: "找不到",
};

const ja: EditorialMessages = {
  foundation: "基盤ルート",
  contentRequired: "コンテンツが必要です",
  about: "概要",
  contact: "お問い合わせ",
  faq: "よくある質問",
  faqTitle: "よくある質問",
  help: "ヘルプ",
  news: "ニュース",
  search: "検索",
  engravings: "刻印",
  humanHandprint: "人の手形",
  humanityChooses: "人類が選ぶ",
  goldenLeaves: "黄金の葉",
  story: "ストーリー",
  menu: "メニュー",
  primaryNavigation: "メインナビゲーション",
  editorialRepository: "編集リポジトリの契約",
  editorialRoute: "編集ルートの契約",
  aboutDescription: "Tree of Unity ページのコンテンツ用プレースホルダー。",
  contactDescription:
    "アクセシブルなフォーム構造は Figma との対応付けに利用できますが、送信先エンドポイントや送信を模擬する動作はありません。",
  submissionNotConfigured: "送信は未設定です",
  contactForm: "お問い合わせフォームの構造",
  name: "お名前",
  email: "メールアドレス",
  contactReason: "お問い合わせの理由",
  message: "メッセージ",
  submissionUnavailable: "送信できません",
  faqDescription:
    "アコーディオンはアクセシブルで、表示形式に依存しません。承認済みの質問と回答の作成は今後の作業です。",
  helpDescription:
    "承認済みのサポート作業とコンテンツはまだ提供されていません。これは再利用可能なセマンティックなルート構造です。",
  newsDescription:
    "編集データは安全な構造化ブロックで表現されます。この基盤では生の HTML を描画しません。",
  workingFixtures: "作業用サンプルデータ",
  articleTitle: "[仮原稿] 基盤の更新",
  articleExcerpt: "[仮原稿] 技術基盤の更新。",
  articleDescription: "編集ルートの契約用の作業用コンテンツデータ。",
  articleNotFound: "記事が見つかりません",
  searchDescription:
    "検索入力には長さの制限があり、現在は確定的なローカル編集サンプルデータのみを検索します。",
  searchFieldDescription:
    "検索は 120 文字以内です。結果にはこの基盤のローカルサンプルデータを使用します。",
  searchLabel: "Tree of Unity を検索",
  searchError: "1〜120 文字で入力してください。",
  results: "検索結果",
  noResults: "該当する結果はありません",
  noResultsMessage: "この検索に一致するローカルサンプルデータはありません。",
  engravingsDescription:
    "このルートは、承認済みの5つの刻印ゾーン識別子に対してアクセシブルなコンテンツ経路を確保します。形状や選択機能は実装していません。",
  stableIdentifiers: "安定したドメイン識別子",
  handprintDescription:
    "このドメインは意図的に近日公開の状態に限定されています。模擬的な操作部品や架空の機能はありません。",
  comingSoon: "近日公開",
  humanityDescription:
    "このドメインは黄金の葉の所有権とは別で、投票機能は実装していません。50枚の葉の物理的な対応関係は未確定であり、架空の対応関係も作成していません。",
  approvedBoundary: "承認済み契約の範囲",
  leafCount: "{count} 枚の葉",
  apexExcluded:
    "頂点の葉 1000 番は対象外です。投票は物理的な葉に紐付けられていません。",
  storyTitle: "人々の物語を共有する場所",
  storyIntro:
    "Tree of Unity は、1,000枚の手作りの金の葉を備えた、高さ5メートルのブロンズ彫刻の計画です。個々の献辞、幹の碑文、そして根元のひとつの手形を組み合わせたデザインです。",
  storyDedications:
    "それぞれの葉は、人、ブランド、組織への献辞として構想されています。名前、メッセージ、献辞がブロンズの幹のデザインの一部を構成します。",
  storyVisualisations:
    "この木はまだ建設されていません。このウェブサイトのシーンはプロジェクトの完成予想図です。",
  returnTree: "木に戻る",
  conditionsOfSale: "販売条件",
  cookies: "Cookie ポリシー",
  privacy: "プライバシーポリシー",
  terms: "利用規約",
  legalNotFound: "法的文書が見つかりません",
  legalDescription:
    "[法的文書が必要です] このテンプレートはセマンティックな文書構造を確保するためのもので、法的助言や承認済みの方針文書ではありません。",
  legalTemplate: "法的文書テンプレート",
  legalRequired: "法的文書が必要です",
  leafTitle: "黄金の葉 {number} 番",
  leafNotFound: "黄金の葉が見つかりません",
  leafDescription:
    "このテンプレートは正規の識別情報、検証、プロバイダーに依存しない検索を示します。承認済みの編集コンテンツと最終的な表示はまだありません。",
  leafRoute: "黄金の葉ルートの契約",
  typedRecord: "型付きレコード",
  canonicalNumber: "正規の番号",
  category: "カテゴリ",
  pendingMapping: "承認済みの物理的な対応関係を待っています",
  status: "状態",
  notSpecified: "未指定",
  standard: "標準",
  apex: "頂点",
  reserved: "予約済み",
  errorHeading: "問題が発生しました",
  retry: "再試行",
  errorMessage:
    "ページを完成できませんでした。診断情報やスタック情報はここには表示されません。",
  errorTitle: "アプリケーションエラー",
  notFoundHeading: "ページが見つかりません",
  returnHome: "ホームに戻る",
  notFoundMessage: "要求されたルートまたはレコードはこの基盤に存在しません。",
  notFoundTitle: "見つかりません",
};

const ko: EditorialMessages = {
  foundation: "기반 경로",
  contentRequired: "콘텐츠 필요",
  about: "소개",
  contact: "문의",
  faq: "자주 묻는 질문",
  faqTitle: "자주 묻는 질문",
  help: "도움말",
  news: "소식",
  search: "검색",
  engravings: "각인",
  humanHandprint: "인간의 손자국",
  humanityChooses: "인류의 선택",
  goldenLeaves: "황금 잎",
  story: "이야기",
  menu: "메뉴",
  primaryNavigation: "주요 탐색",
  editorialRepository: "편집 저장소 계약",
  editorialRoute: "편집 경로 계약",
  aboutDescription: "Tree of Unity 페이지 콘텐츠 자리표시자입니다.",
  contactDescription:
    "접근성을 갖춘 양식 구조를 Figma 매핑에 사용할 수 있지만, 전송 엔드포인트나 가상 전송 동작은 없습니다.",
  submissionNotConfigured: "전송 미설정",
  contactForm: "문의 양식 구조",
  name: "이름",
  email: "이메일",
  contactReason: "문의 사유",
  message: "메시지",
  submissionUnavailable: "전송할 수 없음",
  faqDescription:
    "아코디언 동작은 접근성을 갖추고 표시 방식에 구애받지 않습니다. 승인된 질문과 답변은 아직 작성해야 합니다.",
  helpDescription:
    "승인된 지원 작업과 콘텐츠가 아직 제공되지 않았습니다. 재사용 가능한 의미론적 경로 틀입니다.",
  newsDescription:
    "편집 데이터는 안전한 구조화 블록으로 표현됩니다. 이 기반에는 원시 HTML 렌더링이 포함되지 않습니다.",
  workingFixtures: "임시 예시 데이터",
  articleTitle: "[임시 원고] 기반 업데이트",
  articleExcerpt: "[임시 원고] 기술 기반 업데이트.",
  articleDescription: "편집 경로 계약을 위한 임시 콘텐츠 예시 데이터입니다.",
  articleNotFound: "기사를 찾을 수 없습니다",
  searchDescription:
    "검색 입력 길이는 제한되어 있으며 현재는 결정적인 로컬 편집 예시 데이터만 조회합니다.",
  searchFieldDescription:
    "검색은 120자로 제한됩니다. 결과는 이 기반의 로컬 예시 데이터를 사용합니다.",
  searchLabel: "Tree of Unity 검색",
  searchError: "1~120자를 입력하세요.",
  results: "검색 결과",
  noResults: "검색 결과 없음",
  noResultsMessage: "이 검색어와 일치하는 로컬 예시 데이터가 없습니다.",
  engravingsDescription:
    "이 경로는 승인된 5개 각인 영역 식별자를 위한 접근 가능한 콘텐츠 경로를 확보하며, 형상이나 선택 기능은 구현하지 않습니다.",
  stableIdentifiers: "안정적인 도메인 식별자",
  handprintDescription:
    "이 도메인은 의도적으로 공개 예정 상태로 제한됩니다. 가상 제어 장치나 허위 기능은 없습니다.",
  comingSoon: "공개 예정",
  humanityDescription:
    "이 도메인은 황금 잎 소유권과 별도로 유지되며 투표를 구현하지 않습니다. 50개 잎의 물리적 매핑은 알려지지 않았으며 임의로 만들지 않았습니다.",
  approvedBoundary: "승인된 계약 범위",
  leafCount: "잎 {count}개",
  apexExcluded:
    "꼭대기의 1000번 잎은 제외됩니다. 투표는 실물 잎에 연결되지 않습니다.",
  storyTitle: "인간의 이야기를 함께 나누는 곳",
  storyIntro:
    "Tree of Unity는 수작업으로 만든 금빛 잎 1,000개가 달린 5미터 높이의 청동 조각 계획입니다. 개별 헌정문, 나무줄기의 문구, 밑부분에 남기는 하나의 손자국을 디자인에 담았습니다.",
  storyDedications:
    "각 잎은 한 사람, 브랜드 또는 조직에 대한 헌정으로 구상되었습니다. 이름, 메시지, 헌정문은 청동 나무줄기 디자인의 일부를 이룹니다.",
  storyVisualisations:
    "나무는 아직 제작되지 않았습니다. 이 웹사이트의 장면은 프로젝트 시각화 이미지입니다.",
  returnTree: "나무로 돌아가기",
  conditionsOfSale: "판매 조건",
  cookies: "쿠키 정책",
  privacy: "개인정보 처리방침",
  terms: "이용약관",
  legalNotFound: "법률 문서를 찾을 수 없습니다",
  legalDescription:
    "[법률 문구 필요] 이 템플릿은 의미론적 문서 구조만 확보하며, 법률 자문이나 승인된 정책 문구가 아닙니다.",
  legalTemplate: "법률 문서 템플릿",
  legalRequired: "법률 문구 필요",
  leafTitle: "황금 잎 {number}번",
  leafNotFound: "황금 잎을 찾을 수 없습니다",
  leafDescription:
    "이 템플릿은 표준 식별, 검증, 제공업체에 독립적인 조회를 보여 줍니다. 승인된 편집 콘텐츠와 최종 표현은 제공되지 않습니다.",
  leafRoute: "황금 잎 경로 계약",
  typedRecord: "타입 지정 레코드",
  canonicalNumber: "표준 번호",
  category: "범주",
  pendingMapping: "승인된 물리적 매핑 대기 중",
  status: "상태",
  notSpecified: "지정되지 않음",
  standard: "일반",
  apex: "꼭대기",
  reserved: "예약됨",
  errorHeading: "문제가 발생했습니다",
  retry: "다시 시도",
  errorMessage:
    "페이지를 완료할 수 없습니다. 진단 또는 스택 정보는 여기에 표시되지 않습니다.",
  errorTitle: "애플리케이션 오류",
  notFoundHeading: "페이지를 찾을 수 없습니다",
  returnHome: "홈으로 돌아가기",
  notFoundMessage: "요청한 경로나 레코드가 이 기반에 존재하지 않습니다.",
  notFoundTitle: "찾을 수 없음",
};

const ar: EditorialMessages = {
  foundation: "مسار الأساس",
  contentRequired: "المحتوى مطلوب",
  about: "عن المشروع",
  contact: "تواصل معنا",
  faq: "الأسئلة الشائعة",
  faqTitle: "الأسئلة الشائعة",
  help: "المساعدة",
  news: "الأخبار",
  search: "بحث",
  engravings: "النقوش",
  humanHandprint: "بصمة اليد البشرية",
  humanityChooses: "الإنسانية تختار",
  goldenLeaves: "الأوراق الذهبية",
  story: "القصة",
  menu: "القائمة",
  primaryNavigation: "التنقل الرئيسي",
  editorialRepository: "عقد مستودع المحتوى التحريري",
  editorialRoute: "عقد مسار المحتوى التحريري",
  aboutDescription: "عنصر نائب لمحتوى صفحة Tree of Unity.",
  contactDescription:
    "بنية النموذج الميسّرة متاحة للمطابقة في Figma، لكن لا توجد نقطة إرسال أو محاكاة لعملية الإرسال.",
  submissionNotConfigured: "الإرسال غير مهيّأ",
  contactForm: "بنية نموذج التواصل",
  name: "الاسم",
  email: "البريد الإلكتروني",
  contactReason: "سبب التواصل",
  message: "الرسالة",
  submissionUnavailable: "الإرسال غير متاح",
  faqDescription:
    "سلوك الأقسام القابلة للطي ميسّر ومستقل عن طريقة العرض. لا تزال صياغة الأسئلة والأجوبة المعتمدة ضمن أعمال المحتوى المتبقية.",
  helpDescription:
    "لم تُقدّم مهام الدعم والمحتوى المعتمدان بعد. هذه بنية دلالية قابلة لإعادة الاستخدام للمسار.",
  newsDescription:
    "تُمثَّل البيانات التحريرية بكتل منظّمة وآمنة. لا يتضمن هذا الأساس عرض HTML الخام.",
  workingFixtures: "بيانات أمثلة مؤقتة",
  articleTitle: "[نص أولي] تحديث الأساس",
  articleExcerpt: "[نص أولي] تحديث الأساس التقني.",
  articleDescription: "بيانات محتوى مؤقتة لعقد مسار المحتوى التحريري.",
  articleNotFound: "المقال غير موجود",
  searchDescription:
    "طول إدخال البحث محدود، ويقرأ حاليًا بيانات أمثلة تحريرية محلية وحتمية فقط.",
  searchFieldDescription:
    "البحث محدود بـ 120 حرفًا. تستخدم النتائج بيانات الأمثلة المحلية في هذا الأساس.",
  searchLabel: "البحث في Tree of Unity",
  searchError: "أدخل من حرف واحد إلى 120 حرفًا.",
  results: "النتائج",
  noResults: "لا توجد نتائج",
  noResultsMessage: "لا تطابق أي بيانات أمثلة محلية هذا البحث.",
  engravingsDescription:
    "يحجز هذا المسار طريقًا ميسّرًا للمحتوى الخاص بمعرّفات مناطق النقش الخمس المعتمدة، دون تنفيذ الأشكال الهندسية أو التحديد.",
  stableIdentifiers: "معرّفات نطاق ثابتة",
  handprintDescription:
    "يقتصر هذا النطاق عمدًا على حالة الإتاحة قريبًا. لا توجد عناصر تحكم محاكاة أو وظائف وهمية.",
  comingSoon: "قريبًا",
  humanityDescription:
    "يبقى هذا النطاق منفصلًا عن ملكية الأوراق الذهبية ولا ينفّذ التصويت. المطابقة المادية لأوراقه الخمسين غير معروفة ولم تُختلق.",
  approvedBoundary: "حدود العقد المعتمد",
  leafCount: "{count} ورقة",
  apexExcluded: "ورقة القمة رقم 1000 مستبعدة. التصويت غير مرتبط بورقة مادية.",
  storyTitle: "مكان مشترك لقصص البشر",
  storyIntro:
    "Tree of Unity مشروع منحوتة برونزية بارتفاع خمسة أمتار تضم 1,000 ورقة ذهبية مصنوعة يدويًا. يجمع التصميم إهداءات فردية ونقوشًا على الجذع وبصمة يد واحدة عند القاعدة.",
  storyDedications:
    "تُصمَّم كل ورقة بوصفها إهداءً إلى شخص أو علامة تجارية أو منظمة. تشكّل الأسماء والرسائل والإهداءات جزءًا من تصميم الجذع البرونزي.",
  storyVisualisations:
    "لم تُبنَ الشجرة بعد. المشاهد على هذا الموقع تصوّرات للمشروع.",
  returnTree: "العودة إلى الشجرة",
  conditionsOfSale: "شروط البيع",
  cookies: "سياسة ملفات تعريف الارتباط",
  privacy: "سياسة الخصوصية",
  terms: "شروط الاستخدام",
  legalNotFound: "المستند القانوني غير موجود",
  legalDescription:
    "[نص قانوني مطلوب] يحجز هذا القالب البنية الدلالية للمستند فقط، ولا يُعدّ مشورة قانونية أو نص سياسة معتمدًا.",
  legalTemplate: "قالب مستند قانوني",
  legalRequired: "نص قانوني مطلوب",
  leafTitle: "الورقة الذهبية رقم {number}",
  leafNotFound: "الورقة الذهبية غير موجودة",
  leafDescription:
    "يوضّح هذا القالب الهوية المعيارية والتحقق والبحث المستقل عن المزوّد. المحتوى التحريري المعتمد والعرض النهائي غير متاحين.",
  leafRoute: "عقد مسار الورقة الذهبية",
  typedRecord: "سجل محدد النوع",
  canonicalNumber: "الرقم المعياري",
  category: "الفئة",
  pendingMapping: "بانتظار المطابقة المادية المعتمدة",
  status: "الحالة",
  notSpecified: "غير محدد",
  standard: "قياسية",
  apex: "القمة",
  reserved: "محجوزة",
  errorHeading: "حدث خطأ",
  retry: "حاول مجددًا",
  errorMessage:
    "تعذّر إكمال الصفحة. لا تُعرض هنا معلومات التشخيص أو مكدّس الاستدعاءات.",
  errorTitle: "خطأ في التطبيق",
  notFoundHeading: "الصفحة غير موجودة",
  returnHome: "العودة إلى الصفحة الرئيسية",
  notFoundMessage: "المسار أو السجل المطلوب غير موجود في هذا الأساس.",
  notFoundTitle: "غير موجود",
};

export const editorialCatalog: Readonly<Record<Locale, EditorialMessages>> = {
  en,
  es,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
  fr,
  de,
  ar,
  ja,
  "pt-BR": ptBR,
  ko,
  it,
};

export function getEditorial(locale: Locale): EditorialMessages {
  return editorialCatalog[locale];
}

export function editorialNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale, {
    useGrouping: false,
    numberingSystem: localeNumberingSystem(locale),
  }).format(value);
}

export function goldenLeafTitle(locale: Locale, number: number): string {
  return getEditorial(locale).leafTitle.replace(
    "{number}",
    editorialNumber(locale, number),
  );
}
