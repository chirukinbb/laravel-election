import type {HomeLanguage} from "@/features/home/copy";

interface VotingStoryStep {
  title: string;
  body: string;
}

interface VotingStoryCopy {
  eyebrow: string;
  title: readonly [string, string];
  introduction: string;
  landscapeCaption: string;
  awardEyebrow: string;
  awardTitle: readonly [string, string];
  awardBody: string;
  awardSecond: string;
  portraitCaption: string;
  detailCaption: string;
  statement: readonly [string, string];
  statementBody: string;
  processEyebrow: string;
  processTitle: string;
  steps: readonly [VotingStoryStep, VotingStoryStep, VotingStoryStep];
  returnTitle: string;
  returnAction: string;
  previewNote: string;
}

export const votingStoryCopy: Record<HomeLanguage, VotingStoryCopy> = {
  en: {
    eyebrow: "The meaning of a vote",
    title: ["A human story.", "A shared recognition."],
    introduction:
      "Behind every name is a life shaped by choices. Humanity Chooses invites us to notice the people whose care, courage and everyday actions make a difference to others.",
    landscapeCaption: "Tree of Unity · A place in our shared history",
    awardEyebrow: "The Golden Leaf",
    awardTitle: ["One leaf.", "One name."],
    awardBody:
      "A Golden Leaf is envisioned as a lasting sign of recognition: one person's name, held within the shared story of Tree of Unity.",
    awardSecond:
      "The planned programme brings together 50 monthly rounds. Each round would recognise one person with a Golden Leaf, gradually forming a record of human contribution.",
    portraitCaption: "The Golden Leaf · A symbol of recognition",
    detailCaption: "An individual name within a shared story",
    statement: ["What deserves", "to be remembered?"],
    statementBody:
      "Care offered without an audience. Knowledge shared freely. The patience to keep helping. A nomination begins by telling the story behind those actions.",
    processEyebrow: "Taking part",
    processTitle: "From a story to a choice.",
    steps: [
      {
        title: "Meet the nominees",
        body: "Explore the list or the world map. Open a profile to discover a person's work and the reason they were nominated.",
      },
      {
        title: "Make your choice",
        body: "Consider the stories, then select the person whose contribution speaks to you. You can change your selection before confirming.",
      },
      {
        title: "Confirm your vote",
        body: "Review the name you have chosen and confirm. In this preview, the action demonstrates the voting experience; it does not submit a real vote.",
      },
    ],
    returnTitle: "Discover the people behind the names.",
    returnAction: "View nominees",
    previewNote:
      "Tree of Unity is a planned project. The nominees and votes shown in this preview are fictional.",
  },
  ru: {
    eyebrow: "Смысл голосования",
    title: ["История человека.", "Общее признание."],
    introduction:
      "За каждым именем — жизнь, которую определяют поступки. Humanity Chooses предлагает заметить людей, чья забота, смелость и повседневные решения меняют жизнь других.",
    landscapeCaption: "Tree of Unity · Место в нашей общей истории",
    awardEyebrow: "Золотой Лист",
    awardTitle: ["Один лист.", "Одно имя."],
    awardBody:
      "Золотой Лист задуман как долговечный знак признания: имя одного человека становится частью общей истории Tree of Unity.",
    awardSecond:
      "Планируемая программа включает 50 ежемесячных раундов. В каждом раунде Золотой Лист будет посвящён одному человеку, постепенно создавая историю человеческого вклада.",
    portraitCaption: "Золотой Лист · Символ признания",
    detailCaption: "Личное имя в общей истории",
    statement: ["Что заслуживает", "памяти?"],
    statementBody:
      "Забота без зрителей. Знания, которыми делятся свободно. Терпение помогать снова и снова. Номинация начинается с истории, которая стоит за такими поступками.",
    processEyebrow: "Как участвовать",
    processTitle: "От истории к выбору.",
    steps: [
      {
        title: "Узнайте номинантов",
        body: "Откройте список или карту мира. В профиле можно прочитать о деятельности человека и о том, почему его предложили.",
      },
      {
        title: "Сделайте выбор",
        body: "Познакомьтесь с историями и выберите человека, чей вклад вам близок. До подтверждения выбор можно изменить.",
      },
      {
        title: "Подтвердите голос",
        body: "Проверьте выбранное имя и подтвердите решение. В этой версии действие показывает процесс голосования; реальный голос не отправляется.",
      },
    ],
    returnTitle: "Познакомьтесь с людьми за этими именами.",
    returnAction: "Смотреть номинантов",
    previewNote:
      "Tree of Unity — планируемый проект. Номинанты и голоса в этой демонстрационной версии вымышлены.",
  },
  es: {
    eyebrow: "El significado de un voto",
    title: ["Una historia humana.", "Un reconocimiento compartido."],
    introduction:
      "Detrás de cada nombre hay una vida marcada por decisiones. Humanity Chooses nos invita a reconocer a quienes, con su cuidado, su valentía y sus actos cotidianos, cambian la vida de otras personas.",
    landscapeCaption: "Tree of Unity · Un lugar en nuestra historia compartida",
    awardEyebrow: "La Hoja Dorada",
    awardTitle: ["Una hoja.", "Un nombre."],
    awardBody:
      "La Hoja Dorada se concibe como un símbolo duradero de reconocimiento: el nombre de una persona dentro de la historia compartida de Tree of Unity.",
    awardSecond:
      "El programa previsto contempla 50 rondas mensuales. Cada ronda reconocería a una persona con una Hoja Dorada, formando poco a poco una memoria de la contribución humana.",
    portraitCaption: "La Hoja Dorada · Un símbolo de reconocimiento",
    detailCaption: "Un nombre individual dentro de una historia compartida",
    statement: ["¿Qué merece", "ser recordado?"],
    statementBody:
      "El cuidado sin espectadores. El conocimiento compartido libremente. La paciencia de seguir ayudando. Una nominación comienza al contar la historia que hay detrás de esos actos.",
    processEyebrow: "Cómo participar",
    processTitle: "De una historia a una elección.",
    steps: [
      {
        title: "Conoce a los nominados",
        body: "Explora la lista o el mapa. Abre un perfil para conocer la labor de una persona y el motivo de su nominación.",
      },
      {
        title: "Haz tu elección",
        body: "Lee las historias y elige a la persona cuya contribución te inspire. Puedes cambiar tu selección antes de confirmar.",
      },
      {
        title: "Confirma tu voto",
        body: "Revisa el nombre elegido y confirma. En esta versión, la acción demuestra la experiencia de votación; no se envía un voto real.",
      },
    ],
    returnTitle: "Descubre a las personas detrás de los nombres.",
    returnAction: "Ver nominados",
    previewNote:
      "Tree of Unity es un proyecto previsto. Los nominados y los votos de esta versión de demostración son ficticios.",
  },
};
