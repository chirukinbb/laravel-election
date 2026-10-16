/** Connect owner photography and film here without changing the editorial layout. */
export interface LeafEditorialMedia {
  readonly id: string;
  readonly caption: string;
  readonly alt: string;
  readonly src: string | null;
}

export const leafEditorialMedia: readonly LeafEditorialMedia[] = [
  {
    id: "form",
    caption: "A sculptural form. A personal dedication.",
    alt: "Golden leaf — form and surface",
    src: null,
  },
  {
    id: "pair",
    caption: "Individual leaves within one composition",
    alt: "Two golden leaves",
    src: null,
  },
  {
    id: "portrait",
    caption: "A place for a personal story",
    alt: "A dedication to a person",
    src: null,
  },
  {
    id: "crown",
    caption: "One thousand leaves, brought together",
    alt: "Golden leaves in the crown of Tree of Unity",
    src: null,
  },
  {
    id: "detail",
    caption: "Meaning in every detail",
    alt: "Close detail of a golden leaf",
    src: null,
  },
  {
    id: "surface",
    caption: "The character of the surface",
    alt: "The surface of a golden leaf",
    src: null,
  },
  {
    id: "study",
    caption: "From a single form to a shared symbol",
    alt: "Golden leaf design study",
    src: null,
  },
  {
    id: "contact",
    caption: "Golden Leaves — Tree of Unity",
    alt: "Golden Leaves composition",
    src: null,
  },
];

export const leafEditorialFilm: {
  readonly src: string | null;
  readonly poster: string | null;
} = { src: null, poster: null };
