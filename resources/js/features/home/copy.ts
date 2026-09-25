export type HomeLanguage = "en" | "ru" | "es";

export interface HomeCopy {
  readonly navigation: {
    readonly tree: string;
    readonly story: string;
    readonly voting: string;
    readonly about: string;
    readonly primary: string;
    readonly open: string;
    readonly close: string;
  };
  readonly languageLabel: string;
  readonly soundOn: string;
  readonly soundOff: string;
  readonly soundWord: "SOUND";
  readonly symbolOfHumanity: string;
  readonly lastingLegacy: string;
  readonly explore: string;
  readonly exploreLabel: string;
  readonly listen: string;
  readonly interact: string;
  readonly interactLabel: string;
  readonly treeSurfaceLabel: string;
  readonly closeAudio: string;
  readonly listenPrompt: string;
  readonly storyUnavailable: string;
  readonly playStory: string;
  readonly pauseStory: string;
  readonly subtitles: string;
  readonly enteringTree: string;
  readonly treeUnavailable: string;
  readonly backToTree: string;
  readonly experienceLabel: string;
  readonly notice: {
    readonly soundUnavailable: string;
    readonly soundCannotStart: string;
    readonly playbackPaused: string;
    readonly animationUnavailable: string;
    readonly storyCannotPlay: string;
    readonly treeSlow: string;
  };
}

export const homeLanguages: ReadonlyArray<{
  readonly code: HomeLanguage;
  readonly nativeName: string;
}> = [
  { code: "en", nativeName: "English" },
  { code: "ru", nativeName: "Русский" },
  { code: "es", nativeName: "Español" },
];

// Cinematic interface copy only. Brand, editorial pages, and narration are separate.
export const homeCopy: Readonly<Record<HomeLanguage, HomeCopy>> = {
  en: {
    navigation: {
      tree: "Tree",
      story: "Story",
      voting: "Voting",
      about: "About",
      primary: "Primary",
      open: "Open navigation",
      close: "Close navigation",
    },
    languageLabel: "Language: English",
    soundOn: "Turn sound on",
    soundOff: "Turn sound off",
    soundWord: "SOUND",
    symbolOfHumanity: "A symbol of humanity",
    lastingLegacy: "A lasting legacy for generations",
    explore: "Explore",
    exploreLabel: "Explore the tree",
    listen: "Listen to the story",
    interact: "Interact",
    interactLabel: "Interact with the tree",
    treeSurfaceLabel: "Open the interactive tree",
    closeAudio: "Close audio story",
    listenPrompt: "Turn on your sound to listen",
    storyUnavailable: "Audio story is not available yet.",
    playStory: "Play story",
    pauseStory: "Pause story",
    subtitles: "Subtitles",
    enteringTree: "Entering the tree",
    treeUnavailable: "The tree could not be opened",
    backToTree: "Back to the tree",
    experienceLabel: "Tree of Unity experience",
    notice: {
      soundUnavailable: "Background sound is unavailable.",
      soundCannotStart: "Sound could not start. Try the sound button again.",
      playbackPaused: "Playback paused. Press play to continue.",
      animationUnavailable: "Animation unavailable. Showing the still scene.",
      storyCannotPlay: "The audio story could not be played.",
      treeSlow:
        "The tree is taking longer to load. You can return and try again.",
    },
  },
  ru: {
    navigation: {
      tree: "Дерево",
      story: "История",
      voting: "Голосование",
      about: "О проекте",
      primary: "Основная навигация",
      open: "Открыть навигацию",
      close: "Закрыть навигацию",
    },
    languageLabel: "Язык: русский",
    soundOn: "Включить звук",
    soundOff: "Выключить звук",
    soundWord: "SOUND",
    symbolOfHumanity: "Символ человечества",
    lastingLegacy: "Наследие для будущих поколений",
    explore: "Исследовать",
    exploreLabel: "Исследовать дерево",
    listen: "Послушать историю",
    interact: "Взаимодействовать",
    interactLabel: "Взаимодействовать с деревом",
    treeSurfaceLabel: "Открыть интерактивное дерево",
    closeAudio: "Закрыть аудиорассказ",
    listenPrompt: "Включите звук, чтобы слушать",
    storyUnavailable: "Аудиорассказ пока недоступен.",
    playStory: "Воспроизвести рассказ",
    pauseStory: "Приостановить рассказ",
    subtitles: "Субтитры",
    enteringTree: "Переход к дереву",
    treeUnavailable: "Не удалось открыть дерево",
    backToTree: "Вернуться к дереву",
    experienceLabel: "Знакомство с Tree of Unity",
    notice: {
      soundUnavailable: "Фоновый звук недоступен.",
      soundCannotStart:
        "Не удалось включить звук. Нажмите кнопку звука ещё раз.",
      playbackPaused:
        "Воспроизведение приостановлено. Нажмите кнопку воспроизведения, чтобы продолжить.",
      animationUnavailable:
        "Анимация недоступна. Показано статичное изображение.",
      storyCannotPlay: "Не удалось воспроизвести аудиорассказ.",
      treeSlow:
        "Дерево загружается дольше обычного. Можно вернуться и попробовать снова.",
    },
  },
  es: {
    navigation: {
      tree: "Árbol",
      story: "Historia",
      voting: "Votación",
      about: "Sobre el proyecto",
      primary: "Navegación principal",
      open: "Abrir navegación",
      close: "Cerrar navegación",
    },
    languageLabel: "Idioma: español",
    soundOn: "Activar sonido",
    soundOff: "Desactivar sonido",
    soundWord: "SOUND",
    symbolOfHumanity: "Un símbolo de la humanidad",
    lastingLegacy: "Un legado duradero para las generaciones futuras",
    explore: "Explorar",
    exploreLabel: "Explorar el árbol",
    listen: "Escuchar la historia",
    interact: "Interactuar",
    interactLabel: "Interactuar con el árbol",
    treeSurfaceLabel: "Abrir el árbol interactivo",
    closeAudio: "Cerrar la historia en audio",
    listenPrompt: "Activa el sonido para escuchar",
    storyUnavailable: "La historia en audio aún no está disponible.",
    playStory: "Reproducir historia",
    pauseStory: "Pausar historia",
    subtitles: "Subtítulos",
    enteringTree: "Entrando al árbol",
    treeUnavailable: "No se pudo abrir el árbol",
    backToTree: "Volver al árbol",
    experienceLabel: "Experiencia Tree of Unity",
    notice: {
      soundUnavailable: "El sonido de fondo no está disponible.",
      soundCannotStart:
        "No se pudo activar el sonido. Pulsa de nuevo el botón de sonido.",
      playbackPaused: "Reproducción en pausa. Pulsa reproducir para continuar.",
      animationUnavailable:
        "La animación no está disponible. Se muestra una imagen fija.",
      storyCannotPlay: "No se pudo reproducir la historia en audio.",
      treeSlow:
        "El árbol está tardando más en cargar. Puedes volver e intentarlo de nuevo.",
    },
  },
};
