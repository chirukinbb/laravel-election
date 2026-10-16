import {defineMessages} from "./catalog";
import type {Locale} from "./locales";

export const requiredFieldLabel: Record<Locale, string> = {
  en: "required",
  es: "obligatorio",
  "zh-Hans": "必填",
  "zh-Hant": "必填",
  fr: "obligatoire",
  de: "erforderlich",
  ar: "مطلوب",
  ja: "必須",
  "pt-BR": "obrigatório",
  ko: "필수",
  it: "obbligatorio",
};

export const commonMessages = defineMessages(
  {
    skip: "Skip to main content",
    preview: "Project visualisation",
    description:
      "Discover Tree of Unity, a project celebrating humanity, memory and connection.",
  },
  {
    es: {
      skip: "Ir al contenido principal",
      preview: "Visualización del proyecto",
      description:
        "Descubre Tree of Unity, un proyecto que celebra la humanidad, la memoria y los vínculos que nos unen.",
    },
    "zh-Hans": {
      skip: "跳至主要内容",
      preview: "项目构想展示",
      description: "探索 Tree of Unity，一个礼赞人类、记忆与联结的项目。",
    },
    "zh-Hant": {
      skip: "跳至主要內容",
      preview: "專案構想展示",
      description: "探索 Tree of Unity，一個禮讚人類、記憶與連結的專案。",
    },
    fr: {
      skip: "Aller au contenu principal",
      preview: "Visualisation du projet",
      description:
        "Découvrez Tree of Unity, un projet qui célèbre l’humanité, la mémoire et les liens qui nous unissent.",
    },
    de: {
      skip: "Zum Hauptinhalt",
      preview: "Projektvisualisierung",
      description:
        "Entdecken Sie Tree of Unity, ein Projekt im Zeichen von Menschlichkeit, Erinnerung und Verbundenheit.",
    },
    ar: {
      skip: "انتقل إلى المحتوى الرئيسي",
      preview: "تصوّر المشروع",
      description:
        "اكتشف Tree of Unity، مشروعًا يحتفي بالإنسانية والذاكرة والروابط التي تجمعنا.",
    },
    ja: {
      skip: "メインコンテンツへ移動",
      preview: "プロジェクトの完成イメージ",
      description:
        "人類、記憶、そして人と人とのつながりを讃えるプロジェクト、Tree of Unityをご覧ください。",
    },
    "pt-BR": {
      skip: "Ir para o conteúdo principal",
      preview: "Visualização do projeto",
      description:
        "Conheça o Tree of Unity, um projeto que celebra a humanidade, a memória e os laços que nos unem.",
    },
    ko: {
      skip: "본문으로 이동",
      preview: "프로젝트 구상도",
      description:
        "인류와 기억, 서로를 잇는 유대를 기리는 프로젝트 Tree of Unity를 만나보세요.",
    },
    it: {
      skip: "Vai al contenuto principale",
      preview: "Visualizzazione del progetto",
      description:
        "Scopri Tree of Unity, un progetto che celebra l’umanità, la memoria e i legami che ci uniscono.",
    },
  },
);
