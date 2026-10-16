import manifest from "../../../../public/manifest.json";

export interface SceneMedia {
  readonly poster: string;
  readonly posterSrcSet?: string;
  readonly video: string | null;
  readonly containsUi: boolean;
}

export interface CinematicMedia {
  readonly home: SceneMedia;
  readonly reveal: SceneMedia;
  readonly night: SceneMedia;
  readonly audioTransition: {
    readonly video: string;
    readonly videoSmall: string;
    readonly webm: string;
    readonly webmSmall: string;
  };
  readonly turn: {
    readonly video: string | null;
    readonly videoSmall?: string;
    readonly reverseVideo?: string;
    readonly reverseVideoSmall?: string;
    readonly duration?: number;
    readonly frameRate?: number;
  };
  readonly goldTransition: { readonly video: string | null };
  readonly ambient: { readonly audio: string };
  readonly audioStory: {
    readonly audio: string | null;
    readonly captions: string | null;
    readonly language: string;
  };
  readonly tree: { readonly model: string };
  readonly logo: string;
  readonly logoBlack: string;
}

export const cinematicMedia: CinematicMedia = manifest;
