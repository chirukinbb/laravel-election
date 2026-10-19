import type {Locale} from "@/i18n/locales";
import {addDemoProfileDetails, type NomineeProfileDetails,} from "./profile-data";
import {type TranslatedNomineeId, translateNomineeText,} from "./nominee-translations";

/** Fictional demonstration data. No person, nomination or vote here is real. */
export type LocalizedNomineeText = Record<Locale, string>;

export interface Supporter {
  id: string;
  name: string;
  /** ISO 3166-1 alpha-2 code, shared with the voting country directory. */
  country: string;
}

export interface Nominee extends NomineeProfileDetails {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  activity: LocalizedNomineeText;
  reason: LocalizedNomineeText;
  qualities: LocalizedNomineeText;
  contribution: LocalizedNomineeText;
  portraitUrl: string;
}

export const NOMINEE_PORTRAIT_ATLAS = "/media/voting/nominees-atlas.webp";
export const NOMINEE_PORTRAIT_COLUMNS = 5;
export const NOMINEE_PORTRAIT_ROWS = 4;

const text = (en: string, es: string) => ({ en, es });

// A deterministic name matrix keeps all demonstration voter IDs and names unique.
// The complete lists below are the only source of the displayed vote totals.
const supporterNameGroups = [
  {
    countries: ["AR", "CL", "MX", "PY", "ES"],
    first: [
      "Alma",
      "Bruno",
      "Clara",
      "Darío",
      "Elena",
      "Fabio",
      "Inés",
      "Julián",
      "Lidia",
      "Nicolás",
      "Pilar",
      "Tomás",
    ],
    last: [
      "Aranda",
      "Beltrán",
      "Carmona",
      "Delgado",
      "Esquivel",
      "Figueroa",
      "Galván",
      "Herrera",
      "Ibarra",
      "Lozano",
      "Molina",
      "Varela",
    ],
  },
  {
    countries: ["AU", "CA", "NZ", "US", "GB"],
    first: [
      "Ada",
      "Callum",
      "Elise",
      "Finn",
      "Hazel",
      "Jasper",
      "Leah",
      "Miles",
      "Nora",
      "Owen",
      "Ruby",
      "Theo",
    ],
    last: [
      "Alder",
      "Bennett",
      "Caldwell",
      "Dawson",
      "Ellis",
      "Fletcher",
      "Hartley",
      "Keaton",
      "Lennox",
      "Mercer",
      "Rowan",
      "Sawyer",
    ],
  },
  {
    countries: ["FR", "BE", "CH"],
    first: [
      "Amélie",
      "Bastien",
      "Céleste",
      "Émile",
      "Flora",
      "Gaspard",
      "Jeanne",
      "Lucien",
      "Maëlle",
      "Noé",
      "Solène",
      "Théo",
    ],
    last: [
      "Aubry",
      "Besson",
      "Charrier",
      "Delorme",
      "Faure",
      "Garnier",
      "Lenoir",
      "Marchand",
      "Perrin",
      "Renaud",
      "Rivière",
      "Valette",
    ],
  },
  {
    countries: ["IN"],
    first: [
      "Aditi",
      "Arjun",
      "Diya",
      "Ishan",
      "Kavya",
      "Kiran",
      "Meera",
      "Nikhil",
      "Priya",
      "Rohan",
      "Sana",
      "Varun",
    ],
    last: [
      "Batra",
      "Desai",
      "Joshi",
      "Kapoor",
      "Malhotra",
      "Menon",
      "Nair",
      "Rao",
      "Sethi",
      "Shah",
      "Suri",
      "Varma",
    ],
  },
  {
    countries: ["KE", "TZ", "UG"],
    first: [
      "Amani",
      "Baraka",
      "Faraja",
      "Imani",
      "Jabari",
      "Jamila",
      "Juma",
      "Nia",
      "Rehema",
      "Salim",
      "Tulia",
      "Zawadi",
    ],
    last: [
      "Kamau",
      "Kariuki",
      "Kato",
      "Kibwana",
      "Kiptoo",
      "Kweka",
      "Maina",
      "Mbeki",
      "Moshi",
      "Mugisha",
      "Mwangi",
      "Otieno",
    ],
  },
  {
    countries: ["JP"],
    first: [
      "Akari",
      "Daichi",
      "Emi",
      "Haruto",
      "Hina",
      "Kaori",
      "Kenta",
      "Mei",
      "Ren",
      "Rina",
      "Sora",
      "Yui",
    ],
    last: [
      "Aoki",
      "Fujita",
      "Hayashi",
      "Ishida",
      "Kawano",
      "Mizuno",
      "Morita",
      "Nakano",
      "Okada",
      "Sakai",
      "Shimizu",
      "Ueda",
    ],
  },
] as const;

function makeSupporters(start: number, count: number): readonly Supporter[] {
  return Array.from({ length: count }, (_, offset) => {
    const serial = start + offset;
    const group =
      supporterNameGroups[serial % supporterNameGroups.length] ??
      supporterNameGroups[0];
    const withinGroup = Math.floor(serial / supporterNameGroups.length);
    const firstName =
      group.first[withinGroup % group.first.length] ?? group.first[0];
    const lastName =
      group.last[
        Math.floor(withinGroup / group.first.length) % group.last.length
      ] ?? group.last[0];
    return {
      id: `demo-supporter-${String(serial + 1).padStart(4, "0")}`,
      name: `${firstName} ${lastName}`,
      country:
        group.countries[withinGroup % group.countries.length] ??
        group.countries[0],
    };
  });
}

type SourceProfile = Omit<
  Nominee,
  | "supporters"
  | "id"
  | "activity"
  | "reason"
  | "qualities"
  | "contribution"
  | keyof NomineeProfileDetails
> & { id: TranslatedNomineeId } & Record<
    "activity" | "reason" | "qualities" | "contribution",
    { en: string; es: string }
  >;
const profiles: readonly SourceProfile[] = [
  {
    id: "demo-ana-vera",
    firstName: "Ana",
    lastName: "Vera",
    country: "PY",
    portraitIndex: 0,
    activity: text("Community librarian", "Bibliotecaria comunitaria"),
    reason: text(
      "Her neighbours nominated her for turning a disused room into a welcoming place to read, learn and meet.",
      "Sus vecinos la propusieron por transformar una sala en desuso en un lugar acogedor para leer, aprender y reunirse.",
    ),
    qualities: text(
      "Patient, resourceful and attentive to people who are often overlooked.",
      "Paciente, ingeniosa y atenta a las personas que suelen pasar desapercibidas.",
    ),
    contribution: text(
      "She coordinates a travelling book box and pairs volunteer readers with older residents who cannot easily leave home.",
      "Coordina una biblioteca itinerante y conecta a lectores voluntarios con personas mayores que tienen dificultades para salir de casa.",
    ),
  },
  {
    id: "demo-rafael-nunes",
    firstName: "Rafael",
    lastName: "Nunes",
    country: "BR",
    portraitIndex: 1,
    activity: text(
      "River restoration coordinator",
      "Coordinador de restauración fluvial",
    ),
    reason: text(
      "Local families nominated him for bringing neighbours together around the care of their shared riverbank.",
      "Las familias de su comunidad lo propusieron por reunir a los vecinos para cuidar la ribera que comparten.",
    ),
    qualities: text(
      "Steady, collaborative and willing to listen before acting.",
      "Constante, colaborativo y dispuesto a escuchar antes de actuar.",
    ),
    contribution: text(
      "He helps schools grow native seedlings and organises small clean-up teams that return to the same sites throughout the year.",
      "Ayuda a las escuelas a cultivar plantas autóctonas y organiza pequeños equipos que cuidan los mismos lugares durante todo el año.",
    ),
  },
  {
    id: "demo-amara-ndele",
    firstName: "Amara",
    lastName: "Ndele",
    country: "KE",
    portraitIndex: 2,
    activity: text(
      "Inclusive learning mentor",
      "Mentora de aprendizaje inclusivo",
    ),
    reason: text(
      "Parents nominated her for making after-school learning feel possible and welcoming for children with different needs.",
      "Las familias la propusieron por hacer que el aprendizaje extraescolar resulte accesible y acogedor para niños con distintas necesidades.",
    ),
    qualities: text(
      "Empathetic, inventive and quietly persistent.",
      "Empática, creativa y discretamente perseverante.",
    ),
    contribution: text(
      "She makes tactile reading materials with local volunteers and supports families in building everyday learning routines.",
      "Elabora materiales de lectura táctil con voluntarios locales y ayuda a las familias a integrar el aprendizaje en la vida cotidiana.",
    ),
  },
  {
    id: "demo-kenji-morihara",
    firstName: "Kenji",
    lastName: "Morihara",
    country: "JP",
    portraitIndex: 3,
    activity: text(
      "Repair workshop organiser",
      "Organizador de talleres de reparación",
    ),
    reason: text(
      "Workshop visitors nominated him for sharing practical skills generously and making repair a shared community habit.",
      "Los visitantes de su taller lo propusieron por compartir sus conocimientos y convertir la reparación en una costumbre comunitaria.",
    ),
    qualities: text(
      "Meticulous, generous with his time and encouraging to beginners.",
      "Minucioso, generoso con su tiempo y alentador con quienes empiezan.",
    ),
    contribution: text(
      "He runs open repair afternoons where teenagers and retired craftspeople restore lamps, clothing and household objects together.",
      "Organiza tardes abiertas en las que adolescentes y artesanos jubilados restauran juntos lámparas, ropa y objetos del hogar.",
    ),
  },
  {
    id: "demo-meera-devan",
    firstName: "Meera",
    lastName: "Devan",
    country: "IN",
    portraitIndex: 4,
    activity: text(
      "Community garden educator",
      "Educadora de huertos comunitarios",
    ),
    reason: text(
      "Her neighbours nominated her for creating a garden where people of different generations learn and grow food together.",
      "Sus vecinos la propusieron por crear un huerto donde distintas generaciones aprenden y cultivan juntas.",
    ),
    qualities: text(
      "Warm, practical and attentive to shared responsibility.",
      "Cercana, práctica y comprometida con la responsabilidad compartida.",
    ),
    contribution: text(
      "She keeps a seed-sharing cupboard, teaches composting and invites older gardeners to pass on their knowledge to children.",
      "Mantiene un armario de intercambio de semillas, enseña compostaje e invita a horticultores mayores a compartir sus conocimientos con niños.",
    ),
  },
  {
    id: "demo-claire-delacour",
    firstName: "Claire",
    lastName: "Delacour",
    country: "FR",
    portraitIndex: 5,
    activity: text(
      "Intergenerational arts facilitator",
      "Facilitadora de arte intergeneracional",
    ),
    reason: text(
      "Participants nominated her for helping isolated neighbours find companionship through making things together.",
      "Los participantes la propusieron por ayudar a vecinos aislados a encontrar compañía a través de la creación compartida.",
    ),
    qualities: text(
      "Open-minded, gentle and able to bring out other people's confidence.",
      "Abierta, delicada y capaz de despertar la confianza de otras personas.",
    ),
    contribution: text(
      "She brings students and older residents together to record neighbourhood memories and turn them into handmade books.",
      "Reúne a estudiantes y personas mayores para recoger recuerdos del barrio y convertirlos en libros artesanales.",
    ),
  },
  {
    id: "demo-daniel-ashford",
    firstName: "Daniel",
    lastName: "Ashford",
    country: "CA",
    portraitIndex: 6,
    activity: text(
      "Accessible outdoor guide",
      "Guía de actividades accesibles al aire libre",
    ),
    reason: text(
      "Walkers nominated him for helping people with different mobility needs enjoy local green spaces on their own terms.",
      "Los participantes lo propusieron por ayudar a personas con distintas necesidades de movilidad a disfrutar de los espacios verdes a su manera.",
    ),
    qualities: text(
      "Observant, dependable and respectful of each person's pace.",
      "Observador, fiable y respetuoso con el ritmo de cada persona.",
    ),
    contribution: text(
      "He maps resting places and step-free routes with residents, then leads small walks with time for conversation and discovery.",
      "Identifica con los vecinos zonas de descanso y rutas sin escalones, y organiza paseos tranquilos con tiempo para conversar y descubrir.",
    ),
  },
  {
    id: "demo-lucia-serrano",
    firstName: "Lucía",
    lastName: "Serrano",
    country: "MX",
    portraitIndex: 7,
    activity: text(
      "Food-sharing organiser",
      "Organizadora de redes de alimentos",
    ),
    reason: text(
      "Market traders nominated her for building a respectful way to share surplus food with neighbours who need it.",
      "Los comerciantes del mercado la propusieron por crear una forma respetuosa de compartir excedentes de alimentos con quienes los necesitan.",
    ),
    qualities: text(
      "Organised, discreet and good at connecting people.",
      "Organizada, discreta y hábil para conectar a las personas.",
    ),
    contribution: text(
      "She coordinates a rotating collection team and a community kitchen where neighbours exchange recipes as well as meals.",
      "Coordina turnos de recogida y una cocina comunitaria donde los vecinos comparten recetas además de comidas.",
    ),
  },
  {
    id: "demo-omar-nadim",
    firstName: "Omar",
    lastName: "Nadim",
    country: "EG",
    portraitIndex: 8,
    activity: text("Youth music mentor", "Mentor musical de jóvenes"),
    reason: text(
      "Young musicians nominated him for giving beginners a patient listener and a place to practise without pressure.",
      "Jóvenes músicos lo propusieron por ofrecer a los principiantes una escucha paciente y un lugar donde practicar sin presión.",
    ),
    qualities: text(
      "Patient, encouraging and deeply committed to mutual respect.",
      "Paciente, alentador y profundamente comprometido con el respeto mutuo.",
    ),
    contribution: text(
      "He restores donated instruments and hosts small ensemble sessions in which every participant can contribute a musical idea.",
      "Restaura instrumentos donados y organiza pequeños conjuntos en los que cada participante puede aportar una idea musical.",
    ),
  },
  {
    id: "demo-tessa-marwood",
    firstName: "Tessa",
    lastName: "Marwood",
    country: "AU",
    portraitIndex: 9,
    activity: text(
      "Coastal habitat volunteer",
      "Voluntaria de hábitats costeros",
    ),
    reason: text(
      "Her volunteer team nominated her for making long-term care of a small stretch of coastline a shared local commitment.",
      "Su equipo la propuso por convertir el cuidado continuado de un pequeño tramo de costa en un compromiso compartido.",
    ),
    qualities: text(
      "Consistent, curious and generous in recognising other people's efforts.",
      "Constante, curiosa y generosa al reconocer el esfuerzo de los demás.",
    ),
    contribution: text(
      "She organises dune planting days and helps families observe seasonal changes without disturbing nesting wildlife.",
      "Organiza jornadas de plantación en dunas y ayuda a las familias a observar los cambios estacionales sin molestar a la fauna que anida.",
    ),
  },
  {
    id: "demo-lukas-felden",
    firstName: "Lukas",
    lastName: "Felden",
    country: "DE",
    portraitIndex: 10,
    activity: text(
      "Apprenticeship volunteer",
      "Voluntario de formación en oficios",
    ),
    reason: text(
      "Former learners nominated him for sharing workshop skills with people starting again later in life.",
      "Sus antiguos alumnos lo propusieron por enseñar oficios a personas que empiezan de nuevo en una etapa adulta.",
    ),
    qualities: text(
      "Patient, fair and careful to celebrate small steps forward.",
      "Paciente, justo y atento a celebrar cada pequeño avance.",
    ),
    contribution: text(
      "He holds open woodworking sessions and helps participants create practical objects they can take home or donate locally.",
      "Imparte sesiones abiertas de carpintería y ayuda a crear objetos útiles para llevar a casa o donar en la comunidad.",
    ),
  },
  {
    id: "demo-sari-pranata",
    firstName: "Sari",
    lastName: "Pranata",
    country: "ID",
    portraitIndex: 11,
    activity: text(
      "Neighbourhood compost educator",
      "Educadora de compostaje vecinal",
    ),
    reason: text(
      "Residents nominated her for making everyday waste reduction understandable, friendly and practical.",
      "Los vecinos la propusieron por hacer que reducir los residuos cotidianos resulte comprensible, cercano y práctico.",
    ),
    qualities: text(
      "Approachable, inventive and attentive to everyday constraints.",
      "Cercana, creativa y atenta a las dificultades cotidianas.",
    ),
    contribution: text(
      "She helps households start small compost bins and shares the resulting soil with a neighbourhood planting group.",
      "Ayuda a las familias a iniciar pequeños compostadores y comparte la tierra obtenida con un grupo de jardinería vecinal.",
    ),
  },
  {
    id: "demo-malik-sow",
    firstName: "Malik",
    lastName: "Sow",
    country: "SN",
    portraitIndex: 12,
    activity: text("Community sports mentor", "Mentor deportivo comunitario"),
    reason: text(
      "Families nominated him for making sport a welcoming meeting place for young people with different backgrounds and abilities.",
      "Las familias lo propusieron por hacer del deporte un lugar de encuentro para jóvenes con distintos orígenes y capacidades.",
    ),
    qualities: text(
      "Fair-minded, energetic and quick to include someone standing on the sidelines.",
      "Justo, enérgico y atento a incluir a quienes se quedan al margen.",
    ),
    contribution: text(
      "He organises mixed-ability games, repairs shared equipment and invites older players to mentor new participants.",
      "Organiza juegos para distintos niveles, repara el material compartido e invita a jugadores experimentados a acompañar a los nuevos.",
    ),
  },
  {
    id: "demo-isabel-olmeda",
    firstName: "Isabel",
    lastName: "Olmeda",
    country: "CL",
    portraitIndex: 13,
    activity: text(
      "Community seed keeper",
      "Guardiana de semillas comunitarias",
    ),
    reason: text(
      "Local growers nominated her for protecting everyday gardening knowledge and sharing it freely with new neighbours.",
      "Los horticultores locales la propusieron por conservar los conocimientos cotidianos del cultivo y compartirlos con nuevos vecinos.",
    ),
    qualities: text(
      "Thoughtful, methodical and generous with knowledge.",
      "Reflexiva, metódica y generosa con sus conocimientos.",
    ),
    contribution: text(
      "She records the stories behind shared seeds and hosts seasonal exchanges where experienced growers guide first-time gardeners.",
      "Recoge las historias de las semillas compartidas y organiza intercambios estacionales donde los horticultores experimentados ayudan a quienes empiezan.",
    ),
  },
  {
    id: "demo-eli-whetu",
    firstName: "Eli",
    lastName: "Whetu",
    country: "NZ",
    portraitIndex: 14,
    activity: text(
      "Neighbourhood tool library organiser",
      "Organizador de una biblioteca de herramientas",
    ),
    reason: text(
      "Borrowers nominated him for making practical tools and patient guidance available to people who cannot buy their own equipment.",
      "Los usuarios lo propusieron por facilitar herramientas y orientación paciente a quienes no pueden comprar su propio equipo.",
    ),
    qualities: text(
      "Dependable, welcoming and committed to sharing fairly.",
      "Fiable, acogedor y comprometido con un acceso justo.",
    ),
    contribution: text(
      "He maintains donated tools, explains safe handling and brings neighbours together for small repair projects.",
      "Mantiene herramientas donadas, explica su uso seguro y reúne a los vecinos para pequeños proyectos de reparación.",
    ),
  },
  {
    id: "demo-marta-valsera",
    firstName: "Marta",
    lastName: "Valsera",
    country: "ES",
    portraitIndex: 15,
    activity: text(
      "Neighbourhood welcome coordinator",
      "Coordinadora de bienvenida vecinal",
    ),
    reason: text(
      "New residents nominated her for helping them feel part of the neighbourhood through ordinary acts of welcome.",
      "Los nuevos residentes la propusieron por ayudarles a sentirse parte del barrio mediante gestos cotidianos de bienvenida.",
    ),
    qualities: text(
      "Kind, discreet and good at making introductions without pressure.",
      "Amable, discreta y hábil para conectar a las personas sin presionarlas.",
    ),
    contribution: text(
      "She hosts conversation tables and pairs newcomers with volunteer neighbours for visits to libraries and local services.",
      "Organiza mesas de conversación y conecta a recién llegados con vecinos voluntarios para visitar bibliotecas y servicios locales.",
    ),
  },
  {
    id: "demo-anil-kharel",
    firstName: "Anil",
    lastName: "Kharel",
    country: "NP",
    portraitIndex: 16,
    activity: text("Walking-route caretaker", "Cuidador de rutas peatonales"),
    reason: text(
      "Neighbours nominated him for the patient work of keeping shared paths welcoming and helping travellers find their way.",
      "Sus vecinos lo propusieron por cuidar con paciencia los caminos compartidos y ayudar a los caminantes a orientarse.",
    ),
    qualities: text(
      "Steady, observant and generous with practical advice.",
      "Constante, observador y generoso con sus consejos prácticos.",
    ),
    contribution: text(
      "He coordinates small path-care days, documents spots needing attention and helps young volunteers learn to care for common spaces.",
      "Coordina jornadas de cuidado de caminos, señala los lugares que necesitan atención y enseña a jóvenes voluntarios a cuidar los espacios comunes.",
    ),
  },
  {
    id: "demo-nia-bellamy",
    firstName: "Nia",
    lastName: "Bellamy",
    country: "US",
    portraitIndex: 17,
    activity: text(
      "Community storytelling facilitator",
      "Facilitadora de relatos comunitarios",
    ),
    reason: text(
      "Participants nominated her for creating a thoughtful space where neighbours can share experiences and listen without judgement.",
      "Los participantes la propusieron por crear un espacio donde los vecinos comparten sus experiencias y escuchan sin juzgar.",
    ),
    qualities: text(
      "Attentive, reflective and careful with other people's trust.",
      "Atenta, reflexiva y cuidadosa con la confianza de los demás.",
    ),
    contribution: text(
      "She hosts story circles and helps residents make consent-based audio keepsakes for their families.",
      "Organiza círculos de relatos y ayuda a los vecinos, con su consentimiento, a crear recuerdos sonoros para sus familias.",
    ),
  },
  {
    id: "demo-tari-kimani",
    firstName: "Tari",
    lastName: "Kimani",
    country: "KE",
    portraitIndex: 18,
    activity: text(
      "Bicycle repair mentor",
      "Mentor de reparación de bicicletas",
    ),
    reason: text(
      "Young riders nominated him for making bicycle maintenance an approachable skill and a chance to help one another.",
      "Jóvenes ciclistas lo propusieron por hacer del mantenimiento de bicicletas una habilidad accesible y una oportunidad de ayudarse.",
    ),
    qualities: text(
      "Patient, upbeat and generous with hands-on guidance.",
      "Paciente, optimista y generoso con la ayuda práctica.",
    ),
    contribution: text(
      "He restores donated bicycles with learners and runs simple maintenance sessions where everyone practises the skills themselves.",
      "Restaura bicicletas donadas con sus alumnos y organiza sesiones sencillas en las que todos practican por sí mismos.",
    ),
  },
  {
    id: "demo-elena-arvelo",
    firstName: "Elena",
    lastName: "Arvelo",
    country: "PY",
    portraitIndex: 19,
    activity: text(
      "Neighbourhood meal coordinator",
      "Coordinadora de comidas vecinales",
    ),
    reason: text(
      "Neighbours nominated her for turning shared meals into a dependable source of companionship and practical support.",
      "Sus vecinos la propusieron por convertir las comidas compartidas en una fuente constante de compañía y apoyo práctico.",
    ),
    qualities: text(
      "Warm, reliable and attentive to people who hesitate to ask for help.",
      "Cálida, fiable y atenta a quienes dudan en pedir ayuda.",
    ),
    contribution: text(
      "She coordinates cooking rotas and invites older residents to share favourite recipes with younger volunteers.",
      "Coordina turnos de cocina e invita a personas mayores a compartir sus recetas favoritas con voluntarios jóvenes.",
    ),
  },
];

const supporterCounts = [
  48, 44, 42, 39, 36, 34, 31, 29, 27, 25, 24, 22, 20, 18, 17, 15, 13, 11, 9, 8,
];

export const nominees: readonly Nominee[] = profiles.map((profile, index) => {
  const count = supporterCounts[index];
  if (count === undefined) {
    throw new Error(`Missing demonstration supporter count for ${profile.id}`);
  }
  return addDemoProfileDetails(
      {
        ...profile,
        portraitIndex: index,
        portraitUrl: NOMINEE_PORTRAIT_ATLAS,
        activity: translateNomineeText(profile.id, "activity", profile.activity),
        reason: translateNomineeText(profile.id, "reason", profile.reason),
        qualities: translateNomineeText(
            profile.id,
            "qualities",
            profile.qualities,
        ),
        contribution: translateNomineeText(
            profile.id,
            "contribution",
        profile.contribution,
      ),
      supporters: makeSupporters(
        supporterCounts
          .slice(0, index)
          .reduce((total, value) => total + value, 0),
        count,
      ),
    },
    index,
  );
});
