import {type Locale, locales} from "@/i18n/locales";

type LocalizedText = Record<Locale, string>;

export interface NomineeContribution {
  id: string;
  /** ISO calendar date, interpreted in UTC rather than the viewer's time zone. */
  date: string;
  description: LocalizedText;
  beneficiaries: LocalizedText;
  image?: string;
}
export interface NomineeLink {
  label: LocalizedText;
  url: string;
}
export interface NomineeProfileDetails {
  city: string;
  contributions?: readonly NomineeContribution[];
  links?: readonly NomineeLink[];
  nominator?: { name: string; consentToDisplay: boolean };
}

/** Public rendering must opt into attribution; a stored name alone is not consent. */
export function getVisibleNominator(
  person: Pick<NomineeProfileDetails, "nominator">,
): string | null {
  return person.nominator?.consentToDisplay === true
    ? person.nominator.name.trim() || null
    : null;
}

const demoCities = [
  "Asunción",
  "Curitiba",
  "Nairobi",
  "Kyoto",
  "Bengaluru",
  "Lyon",
  "Halifax",
  "Oaxaca",
  "Alexandria",
  "Perth",
  "Leipzig",
  "Bandung",
  "Dakar",
  "Valparaíso",
  "Wellington",
  "Valencia",
  "Pokhara",
  "Portland",
  "Mombasa",
  "Encarnación",
] as const;
const demoNominators = [
  "Irene Solano",
  "Bianca Duarte",
  "Neema Kito",
  "Yui Takeda",
  "Kavya Raman",
  "Émile Rochat",
  "Nora Ellery",
  "Tomás Beltrán",
  "Salma Farid",
  "Pippa Lawson",
  "Lena Hartwig",
  "Dewi Santara",
  "Awa Faye",
  "Camila Varela",
  "Maia Rangi",
  "Inés Calderón",
  "Sita Thapa",
  "Rowan Ellis",
  "Imani Mwale",
  "Diego Acuña",
] as const;

const community: LocalizedText = {
  en: "Local residents and volunteer participants",
  es: "Vecinos y participantes voluntarios",
  fr: "Habitants du quartier et bénévoles",
  de: "Menschen aus der Nachbarschaft und freiwillig Mitwirkende",
  "pt-BR": "Moradores da comunidade e participantes voluntários",
  it: "Residenti del quartiere e volontari",
  ar: "سكان الحي والمشاركون المتطوعون",
  "zh-Hans": "社区居民与志愿参与者",
  "zh-Hant": "社區居民與志願參與者",
  ja: "地域の住民とボランティアの参加者",
  ko: "지역 주민과 자원봉사 참여자",
};

// These paragraphs describe the fictional nomination's values. Specific actions
// remain attached to each translated profile rather than invented public claims.
const nominationContext: LocalizedText = {
  en: "The nomination recognises the care behind this everyday work: listening to people's needs, sharing practical knowledge and helping neighbours take part at their own pace. Its value is in the relationships it creates and the responsibility shared over time. The people involved can contribute their own ideas, learn from one another and keep the work connected to the life of their community.",
  es: "La propuesta reconoce el cuidado que hay detrás de esta labor cotidiana: escuchar las necesidades de las personas, compartir conocimientos prácticos y ayudar a los vecinos a participar a su propio ritmo. Su valor reside en las relaciones que crea y en la responsabilidad compartida a lo largo del tiempo. Quienes participan pueden aportar sus ideas, aprender unos de otros y vincular esta labor a la vida de su comunidad.",
  fr: "Cette candidature reconnaît l’attention portée au travail quotidien : écouter les besoins, partager des savoirs pratiques et permettre à chacun de participer à son rythme. Sa valeur tient aux liens créés et à la responsabilité partagée dans la durée. Les participants peuvent apporter leurs idées, apprendre les uns des autres et ancrer cette action dans la vie de leur quartier.",
  de: "Die Nominierung würdigt die Sorgfalt hinter dieser alltäglichen Arbeit: Bedürfnisse wahrnehmen, praktisches Wissen teilen und Menschen im eigenen Tempo mitwirken lassen. Ihr Wert liegt in den Beziehungen, die dabei entstehen, und in der langfristig geteilten Verantwortung. Alle Beteiligten können eigene Ideen einbringen, voneinander lernen und die Arbeit im Leben ihrer Gemeinschaft verankern.",
  "pt-BR":
    "A indicação reconhece o cuidado por trás desse trabalho cotidiano: ouvir as necessidades das pessoas, compartilhar conhecimentos práticos e ajudar cada vizinho a participar no próprio ritmo. Seu valor está nos vínculos criados e na responsabilidade compartilhada ao longo do tempo. Os participantes podem contribuir com ideias, aprender uns com os outros e manter o trabalho ligado à vida da comunidade.",
  it: "La candidatura riconosce la cura dietro questo lavoro quotidiano: ascoltare i bisogni delle persone, condividere conoscenze pratiche e aiutare i vicini a partecipare secondo i propri ritmi. Il suo valore risiede nei legami che crea e nella responsabilità condivisa nel tempo. I partecipanti possono portare le proprie idee, imparare gli uni dagli altri e mantenere l’attività legata alla vita della comunità.",
  ar: "يقدّر هذا الترشيح العناية الكامنة وراء العمل اليومي: الإصغاء إلى احتياجات الناس، ومشاركة المعرفة العملية، ومساعدة الجيران على المشاركة وفق ظروفهم وإيقاعهم الخاص. وتكمن قيمة هذه الجهود في العلاقات التي تنشئها والمسؤولية التي يتقاسمها المشاركون مع مرور الوقت. فبوسع كل مشارك أن يطرح أفكاره ويتعلم من الآخرين، وأن يسهم في إبقاء العمل مرتبطًا بالحياة الفعلية للمجتمع واحتياجاته المتغيرة، بما يتيح للناس أن يجدوا دورًا يناسبهم في هذا الجهد المشترك.",
  "zh-Hans":
    "这项提名关注的是日常行动背后的用心：倾听他人的需要，分享实用的经验，让每一位邻居都能按照自己的节奏参与。它的价值不只在于某一次活动，更在于人与人之间逐渐建立的信任，以及愿意长期共同承担的责任。参与者可以提出自己的想法，在互相学习的过程中找到适合自己的角色，让这些行动始终与社区的实际生活保持联系。这里所珍视的不是个人的知名度，也不是一次醒目的成果，而是对身边人的持续关怀。提名希望让这些常常不被注意的付出被看见，尊重每位参与者的时间、经验与选择。当知识能够被耐心分享，当初次加入的人也能得到鼓励，社区便有机会延续共同学习与相互支持的过程。这是这份提名想要记录的意义：在具体而平凡的事情中，帮助人与人重新建立联系，并让更多人拥有参与社区生活的机会。",
  "zh-Hant":
    "這項提名關注的是日常行動背後的用心：傾聽他人的需要，分享實用的經驗，讓每一位鄰居都能按照自己的步調參與。它的價值不只在於某一次活動，更在於人與人之間逐漸建立的信任，以及願意長期共同承擔的責任。參與者可以提出自己的想法，在互相學習的過程中找到適合自己的角色，讓這些行動始終與社區的實際生活保持聯繫。這裡所珍視的不是個人的知名度，也不是一次醒目的成果，而是對身邊人的持續關懷。提名希望讓這些常常不被注意的付出被看見，尊重每位參與者的時間、經驗與選擇。當知識能夠被耐心分享，當初次加入的人也能得到鼓勵，社區便有機會延續共同學習與相互支持的過程。這是這份提名想要記錄的意義：在具體而平凡的事情中，幫助人與人重新建立聯繫，並讓更多人擁有參與社區生活的機會。",
  ja: "この推薦が大切にしているのは、日々の活動に込められた心配りです。一人ひとりの必要に耳を傾け、実践的な知識を分かち合い、誰もが自分のペースで参加できるように支えています。その価値は一度の催しだけではなく、少しずつ育まれる信頼関係や、時間をかけて分かち合う責任にもあります。参加する人は自分の考えを持ち寄り、互いから学び、自分に合った役割を見つけられます。初めて参加する人にも経験を伝え、相手の時間や選択を尊重することが、地域の日常と活動をつないでいます。この推薦は目立つ実績だけを評価するものではありません。見過ごされがちな身近な行動にも光を当て、人と人のつながりや学び合う機会を丁寧に守っていく姿勢を伝えようとしています。そうした積み重ねこそが、推薦に込められた思いです。",
  ko: "이 추천은 일상의 활동 뒤에 담긴 세심한 마음을 기립니다. 사람들의 필요에 귀 기울이고, 실용적인 지식을 나누며, 이웃이 각자의 속도에 맞춰 참여하도록 돕는 태도입니다. 그 가치는 한 번의 행사에만 있지 않습니다. 조금씩 만들어 가는 신뢰와 오랜 시간 함께 나누는 책임에도 있습니다. 참여자들은 자신의 생각을 보태고 서로에게 배우며, 자신에게 맞는 역할을 찾을 수 있습니다. 처음 참여하는 사람을 격려하고 각자의 시간과 경험, 선택을 존중하는 과정이 이 활동을 지역의 실제 생활과 이어 줍니다. 이 추천은 눈에 띄는 성과만을 평가하려는 것이 아닙니다. 쉽게 지나칠 수 있는 작은 실천을 돌아보고, 이웃 사이의 관계와 함께 배우는 기회를 소중하게 지켜 가는 자세를 전하려는 것입니다. 그 꾸준한 마음과 실천이 이 사람을 추천한 이유입니다.",
};

const anaActions: readonly LocalizedText[] = [
  {
    en: "Opened a shared reading room in a previously unused neighbourhood space, with donated books and volunteer reading hours.",
    es: "Abrió una sala de lectura en un espacio vecinal en desuso, con libros donados y sesiones a cargo de voluntarios.",
    fr: "A ouvert une salle de lecture dans un local inutilisé, avec des livres donnés et des heures animées par des bénévoles.",
    de: "Eröffnete einen gemeinsamen Leseraum in einem zuvor ungenutzten Nachbarschaftsraum, mit gespendeten Büchern und ehrenamtlichen Lesestunden.",
    "pt-BR":
      "Abriu uma sala de leitura em um espaço antes sem uso, com livros doados e horários de leitura conduzidos por voluntários.",
    it: "Ha aperto una sala di lettura in uno spazio di quartiere inutilizzato, con libri donati e ore di lettura curate da volontari.",
    ar: "افتتحت غرفة قراءة مشتركة في مساحة مهجورة بالحي، تضم كتبًا متبرعًا بها وساعات قراءة ينظمها متطوعون.",
    "zh-Hans":
      "在社区一处闲置空间开设共享阅览室，提供捐赠书籍和志愿者阅读时段。",
    "zh-Hant": "在社區一處閒置空間開設共享閱覽室，提供捐贈書籍和志工閱讀時段。",
    ja: "使われていなかった地域の一室に、寄贈された本とボランティアによる読書の時間を備えた共有の読書室を開きました。",
    ko: "쓰이지 않던 동네 공간에 기증 도서와 자원봉사 독서 시간이 마련된 공동 독서실을 열었습니다.",
  },
  {
    en: "Started a travelling book box so neighbours could exchange books without needing to visit the reading room.",
    es: "Inició una caja de libros itinerante para que los vecinos intercambien lecturas sin tener que acudir a la sala.",
    fr: "A lancé une boîte à livres itinérante pour permettre aux voisins d’échanger des ouvrages sans se déplacer à la salle.",
    de: "Startete eine wandernde Bücherkiste, damit die Nachbarn Bücher austauschen können, ohne den Leseraum besuchen zu müssen.",
    "pt-BR":
      "Criou uma caixa itinerante de livros para que os vizinhos possam trocar leituras sem precisar ir à sala.",
    it: "Ha avviato una cassetta itinerante di libri perché i vicini possano scambiarli senza recarsi nella sala di lettura.",
    ar: "أطلقت صندوق كتب متنقلًا يتيح للجيران تبادل الكتب دون الحاجة إلى زيارة غرفة القراءة.",
    "zh-Hans": "发起流动图书箱，让邻居无需前往阅览室也能交换书籍。",
    "zh-Hant": "發起流動圖書箱，讓鄰居無需前往閱覽室也能交換書籍。",
    ja: "読書室へ足を運ばなくても近隣の人々が本を交換できるよう、巡回する本箱を始めました。",
    ko: "주민들이 독서실에 가지 않고도 책을 교환할 수 있도록 이동식 책 상자를 운영하기 시작했습니다.",
  },
  {
    en: "Paired volunteer readers with older residents who found it difficult to leave home, creating regular opportunities for conversation and shared reading.",
    es: "Conectó a lectores voluntarios con mayores que tienen dificultades para salir de casa, creando encuentros habituales de lectura y conversación.",
    fr: "A mis des lecteurs bénévoles en relation avec des personnes âgées sortant difficilement, pour des moments réguliers de lecture et de conversation.",
    de: "Brachte ehrenamtliche Vorlesende mit älteren Menschen zusammen, die ihr Zuhause schwer verlassen können, und schuf regelmäßige Gelegenheiten zum Lesen und Gespräch.",
    "pt-BR":
      "Conectou leitores voluntários a idosos com dificuldade para sair de casa, criando oportunidades regulares de leitura e conversa.",
    it: "Ha messo in contatto lettori volontari e anziani che faticano a uscire di casa, creando occasioni regolari di lettura e conversazione.",
    ar: "ربطت قرّاء متطوعين بكبار سن يصعب عليهم مغادرة المنزل، لتوفير فرص منتظمة للحوار والقراءة المشتركة.",
    "zh-Hans":
      "为不便出门的年长居民联系志愿朗读者，创造定期交谈与共同阅读的机会。",
    "zh-Hant":
      "為不便出門的年長居民聯繫志願朗讀者，創造定期交談與共同閱讀的機會。",
    ja: "外出が難しい高齢の住民と朗読ボランティアをつなぎ、定期的に会話と読書を楽しむ機会を作りました。",
    ko: "외출이 어려운 어르신과 낭독 자원봉사자를 연결해 정기적으로 대화하고 함께 책을 읽을 기회를 만들었습니다.",
  },
];

// Reserved .example domains make these fictional links unmistakably non-production.
const anaDemoLinks: readonly NomineeLink[] = [
  {
    url: "https://ana-vera.example/",
    label: {
      en: "Official website",
      es: "Sitio web oficial",
      fr: "Site officiel",
      de: "Offizielle Website",
      "pt-BR": "Site oficial",
      it: "Sito ufficiale",
      ar: "الموقع الرسمي",
      "zh-Hans": "官方网站",
      "zh-Hant": "官方網站",
      ja: "公式サイト",
      ko: "공식 웹사이트",
    },
  },
  {
    url: "https://community.example/ana-vera",
    label: {
      en: "Public profile",
      es: "Perfil público",
      fr: "Profil public",
      de: "Öffentliches Profil",
      "pt-BR": "Perfil público",
      it: "Profilo pubblico",
      ar: "الملف العام",
      "zh-Hans": "公开资料",
      "zh-Hant": "公開資料",
      ja: "公開プロフィール",
      ko: "공개 프로필",
    },
  },
];

interface DemoProfileSource {
  id: string;
  reason: LocalizedText;
  qualities: LocalizedText;
  contribution: LocalizedText;
}

/** Entirely fictional fixture metadata; dates are not assertions about real people. */
export function addDemoProfileDetails<T extends DemoProfileSource>(
  person: T,
  index: number,
): T & NomineeProfileDetails {
  const city = demoCities[index];
  const name = demoNominators[index];
  if (!city || !name)
    throw new Error(`Missing fictional profile details for ${person.id}`);
  const reason = Object.fromEntries(
    locales.map(({ code }) => [
      code,
      [
        person.reason[code],
        person.contribution[code],
        person.qualities[code],
        nominationContext[code],
      ].join(" "),
    ]),
  ) as LocalizedText;
  const descriptions = index === 0 ? anaActions : [person.contribution];
  return {
    ...person,
    reason,
    city,
    ...(index === 0 ? { links: anaDemoLinks } : {}),
    // Absent optional collections deliberately exercise profiles without empty slides.
    ...(index % 4 !== 3
      ? {
          contributions: descriptions.map((description, contributionIndex) => ({
            id: `${person.id}-contribution-${contributionIndex + 1}`,
            date: `${2023 + contributionIndex}-${String((index % 12) + 1).padStart(2, "0")}-15`,
            description,
            beneficiaries: community,
          })),
        }
      : {}),
    nominator: { name, consentToDisplay: index % 2 === 0 },
  };
}
