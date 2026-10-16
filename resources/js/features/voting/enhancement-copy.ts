import type {Locale} from "@/i18n/locales";

type EnhancementCopy = {
  exploreNominee: string;
  openContribution: string;
  closeContribution: string;
  contributionDetails: string;
};
const translations: Record<Locale, readonly [string, string, string, string]> =
  {
    en: [
      "Explore nominee",
      "Open contribution",
      "Close contribution",
      "Contribution details",
    ],
    es: [
      "Conocer al candidato",
      "Abrir contribución",
      "Cerrar contribución",
      "Detalles de la contribución",
    ],
    fr: [
      "Découvrir la candidature",
      "Ouvrir la contribution",
      "Fermer la contribution",
      "Détails de la contribution",
    ],
    de: [
      "Nominierte Person entdecken",
      "Beitrag öffnen",
      "Beitrag schließen",
      "Einzelheiten zum Beitrag",
    ],
    ar: ["اكتشف المرشح", "فتح المساهمة", "إغلاق المساهمة", "تفاصيل المساهمة"],
    "zh-Hans": ["了解候选人", "查看贡献", "关闭贡献", "贡献详情"],
    "zh-Hant": ["了解候選人", "查看貢獻", "關閉貢獻", "貢獻詳情"],
    ja: ["候補者を知る", "貢献を見る", "貢献を閉じる", "貢献の詳細"],
    "pt-BR": [
      "Conhecer a pessoa indicada",
      "Abrir contribuição",
      "Fechar contribuição",
      "Detalhes da contribuição",
    ],
    ko: [
      "후보자 알아보기",
      "기여 내용 열기",
      "기여 내용 닫기",
      "기여 상세 정보",
    ],
    it: [
      "Scopri la persona candidata",
      "Apri il contributo",
      "Chiudi il contributo",
      "Dettagli del contributo",
    ],
  };
export function getEnhancementCopy(locale: Locale): EnhancementCopy {
  const [
    exploreNominee,
    openContribution,
    closeContribution,
    contributionDetails,
  ] = translations[locale];
  return {
    exploreNominee,
    openContribution,
    closeContribution,
    contributionDetails,
  };
}
