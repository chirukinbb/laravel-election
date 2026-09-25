/** Fictional demonstration data. No person, nomination or vote here is real. */
export interface LocalizedNomineeText {
  en: string;
  ru: string;
  es: string;
}

export interface Supporter {
  id: string;
  name: string;
  /** ISO 3166-1 alpha-2 code, shared with the voting country directory. */
  country: string;
}

export interface Nominee {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  activity: LocalizedNomineeText;
  reason: LocalizedNomineeText;
  qualities: LocalizedNomineeText;
  contribution: LocalizedNomineeText;
  /** Zero-based cell in the five-column, four-row portrait atlas. */
  portraitIndex: number;
  supporters: readonly Supporter[];
}

export const NOMINEE_PORTRAIT_ATLAS = "/media/voting/nominees-atlas.webp";
export const NOMINEE_PORTRAIT_COLUMNS = 5;
export const NOMINEE_PORTRAIT_ROWS = 4;

const text = (en: string, ru: string, es: string): LocalizedNomineeText => ({
  en,
  ru,
  es,
});

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

const profiles: readonly Omit<Nominee, "supporters">[] = [
  {
    id: "demo-ana-vera",
    firstName: "Ana",
    lastName: "Vera",
    country: "PY",
    portraitIndex: 0,
    activity: text(
      "Community librarian",
      "Общественный библиотекарь",
      "Bibliotecaria comunitaria",
    ),
    reason: text(
      "Her neighbours nominated her for turning a disused room into a welcoming place to read, learn and meet.",
      "Соседи предложили её за то, что она превратила пустующее помещение в уютное место для чтения, учёбы и встреч.",
      "Sus vecinos la propusieron por transformar una sala en desuso en un lugar acogedor para leer, aprender y reunirse.",
    ),
    qualities: text(
      "Patient, resourceful and attentive to people who are often overlooked.",
      "Терпеливая, находчивая и внимательная к тем, кого часто не замечают.",
      "Paciente, ingeniosa y atenta a las personas que suelen pasar desapercibidas.",
    ),
    contribution: text(
      "She coordinates a travelling book box and pairs volunteer readers with older residents who cannot easily leave home.",
      "Она организует передвижную библиотеку и встречи волонтёров-чтецов с пожилыми жителями, которым трудно выходить из дома.",
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
      "Координатор восстановления рек",
      "Coordinador de restauración fluvial",
    ),
    reason: text(
      "Local families nominated him for bringing neighbours together around the care of their shared riverbank.",
      "Местные семьи предложили его за то, что он объединил соседей вокруг заботы об общем речном береге.",
      "Las familias de su comunidad lo propusieron por reunir a los vecinos para cuidar la ribera que comparten.",
    ),
    qualities: text(
      "Steady, collaborative and willing to listen before acting.",
      "Последовательный, открытый к сотрудничеству, умеет выслушать перед тем, как действовать.",
      "Constante, colaborativo y dispuesto a escuchar antes de actuar.",
    ),
    contribution: text(
      "He helps schools grow native seedlings and organises small clean-up teams that return to the same sites throughout the year.",
      "Он помогает школам выращивать местные растения и организует небольшие группы, которые круглый год ухаживают за одними и теми же участками.",
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
      "Наставница инклюзивного образования",
      "Mentora de aprendizaje inclusivo",
    ),
    reason: text(
      "Parents nominated her for making after-school learning feel possible and welcoming for children with different needs.",
      "Родители предложили её за доступные и доброжелательные занятия после школы для детей с разными потребностями.",
      "Las familias la propusieron por hacer que el aprendizaje extraescolar resulte accesible y acogedor para niños con distintas necesidades.",
    ),
    qualities: text(
      "Empathetic, inventive and quietly persistent.",
      "Чуткая, изобретательная и настойчивая без лишних слов.",
      "Empática, creativa y discretamente perseverante.",
    ),
    contribution: text(
      "She makes tactile reading materials with local volunteers and supports families in building everyday learning routines.",
      "Вместе с волонтёрами она создаёт тактильные материалы для чтения и помогает семьям включать обучение в повседневную жизнь.",
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
      "Организатор ремонтной мастерской",
      "Organizador de talleres de reparación",
    ),
    reason: text(
      "Workshop visitors nominated him for sharing practical skills generously and making repair a shared community habit.",
      "Посетители мастерской предложили его за щедрый обмен навыками и привычку вместе чинить вещи вместо того, чтобы выбрасывать их.",
      "Los visitantes de su taller lo propusieron por compartir sus conocimientos y convertir la reparación en una costumbre comunitaria.",
    ),
    qualities: text(
      "Meticulous, generous with his time and encouraging to beginners.",
      "Внимателен к деталям, щедро делится временем и поддерживает новичков.",
      "Minucioso, generoso con su tiempo y alentador con quienes empiezan.",
    ),
    contribution: text(
      "He runs open repair afternoons where teenagers and retired craftspeople restore lamps, clothing and household objects together.",
      "Он проводит открытые ремонтные встречи, где подростки и мастера на пенсии вместе восстанавливают лампы, одежду и домашние вещи.",
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
      "Педагог общественного сада",
      "Educadora de huertos comunitarios",
    ),
    reason: text(
      "Her neighbours nominated her for creating a garden where people of different generations learn and grow food together.",
      "Соседи предложили её за сад, в котором разные поколения вместе учатся и выращивают еду.",
      "Sus vecinos la propusieron por crear un huerto donde distintas generaciones aprenden y cultivan juntas.",
    ),
    qualities: text(
      "Warm, practical and attentive to shared responsibility.",
      "Доброжелательная, практичная, внимательная к общей ответственности.",
      "Cercana, práctica y comprometida con la responsabilidad compartida.",
    ),
    contribution: text(
      "She keeps a seed-sharing cupboard, teaches composting and invites older gardeners to pass on their knowledge to children.",
      "Она ведёт шкаф обмена семенами, учит компостированию и приглашает опытных садоводов делиться знаниями с детьми.",
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
      "Ведущая межпоколенческих арт-мастерских",
      "Facilitadora de arte intergeneracional",
    ),
    reason: text(
      "Participants nominated her for helping isolated neighbours find companionship through making things together.",
      "Участники предложили её за то, что совместное творчество помогает одиноким соседям обрести общение.",
      "Los participantes la propusieron por ayudar a vecinos aislados a encontrar compañía a través de la creación compartida.",
    ),
    qualities: text(
      "Open-minded, gentle and able to bring out other people's confidence.",
      "Открытая, деликатная, умеет помогать другим поверить в себя.",
      "Abierta, delicada y capaz de despertar la confianza de otras personas.",
    ),
    contribution: text(
      "She brings students and older residents together to record neighbourhood memories and turn them into handmade books.",
      "Она объединяет студентов и пожилых жителей, чтобы собирать воспоминания о районе и превращать их в книги ручной работы.",
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
      "Проводник доступных прогулок",
      "Guía de actividades accesibles al aire libre",
    ),
    reason: text(
      "Walkers nominated him for helping people with different mobility needs enjoy local green spaces on their own terms.",
      "Участники прогулок предложили его за возможность посещать зелёные зоны с учётом разных потребностей в передвижении.",
      "Los participantes lo propusieron por ayudar a personas con distintas necesidades de movilidad a disfrutar de los espacios verdes a su manera.",
    ),
    qualities: text(
      "Observant, dependable and respectful of each person's pace.",
      "Наблюдательный, надёжный, уважает темп каждого человека.",
      "Observador, fiable y respetuoso con el ritmo de cada persona.",
    ),
    contribution: text(
      "He maps resting places and step-free routes with residents, then leads small walks with time for conversation and discovery.",
      "Вместе с жителями он отмечает места отдыха и маршруты без ступеней, а затем проводит неспешные прогулки с общением и открытиями.",
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
      "Организатор обмена продуктами",
      "Organizadora de redes de alimentos",
    ),
    reason: text(
      "Market traders nominated her for building a respectful way to share surplus food with neighbours who need it.",
      "Продавцы рынка предложили её за уважительный способ передавать излишки продуктов нуждающимся соседям.",
      "Los comerciantes del mercado la propusieron por crear una forma respetuosa de compartir excedentes de alimentos con quienes los necesitan.",
    ),
    qualities: text(
      "Organised, discreet and good at connecting people.",
      "Организованная, тактичная, умеет объединять людей.",
      "Organizada, discreta y hábil para conectar a las personas.",
    ),
    contribution: text(
      "She coordinates a rotating collection team and a community kitchen where neighbours exchange recipes as well as meals.",
      "Она координирует дежурства по сбору продуктов и общественную кухню, где соседи делятся и едой, и рецептами.",
      "Coordina turnos de recogida y una cocina comunitaria donde los vecinos comparten recetas además de comidas.",
    ),
  },
  {
    id: "demo-omar-nadim",
    firstName: "Omar",
    lastName: "Nadim",
    country: "EG",
    portraitIndex: 8,
    activity: text(
      "Youth music mentor",
      "Музыкальный наставник молодёжи",
      "Mentor musical de jóvenes",
    ),
    reason: text(
      "Young musicians nominated him for giving beginners a patient listener and a place to practise without pressure.",
      "Юные музыканты предложили его за терпеливую поддержку новичков и место для занятий без давления.",
      "Jóvenes músicos lo propusieron por ofrecer a los principiantes una escucha paciente y un lugar donde practicar sin presión.",
    ),
    qualities: text(
      "Patient, encouraging and deeply committed to mutual respect.",
      "Терпеливый, поддерживающий, ценит взаимное уважение.",
      "Paciente, alentador y profundamente comprometido con el respeto mutuo.",
    ),
    contribution: text(
      "He restores donated instruments and hosts small ensemble sessions in which every participant can contribute a musical idea.",
      "Он восстанавливает подаренные инструменты и проводит небольшие ансамблевые встречи, где каждый может предложить музыкальную идею.",
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
      "Волонтёр прибрежных экосистем",
      "Voluntaria de hábitats costeros",
    ),
    reason: text(
      "Her volunteer team nominated her for making long-term care of a small stretch of coastline a shared local commitment.",
      "Команда волонтёров предложила её за то, что многолетняя забота о небольшом участке побережья стала общим делом.",
      "Su equipo la propuso por convertir el cuidado continuado de un pequeño tramo de costa en un compromiso compartido.",
    ),
    qualities: text(
      "Consistent, curious and generous in recognising other people's efforts.",
      "Последовательная, любознательная, умеет ценить усилия других.",
      "Constante, curiosa y generosa al reconocer el esfuerzo de los demás.",
    ),
    contribution: text(
      "She organises dune planting days and helps families observe seasonal changes without disturbing nesting wildlife.",
      "Она организует посадку растений на дюнах и помогает семьям наблюдать сезонные перемены, не тревожа гнездящихся животных.",
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
      "Волонтёр профессионального наставничества",
      "Voluntario de formación en oficios",
    ),
    reason: text(
      "Former learners nominated him for sharing workshop skills with people starting again later in life.",
      "Бывшие ученики предложили его за обучение ремеслу людей, которые начинают новый путь во взрослом возрасте.",
      "Sus antiguos alumnos lo propusieron por enseñar oficios a personas que empiezan de nuevo en una etapa adulta.",
    ),
    qualities: text(
      "Patient, fair and careful to celebrate small steps forward.",
      "Терпеливый, справедливый, замечает даже небольшие успехи.",
      "Paciente, justo y atento a celebrar cada pequeño avance.",
    ),
    contribution: text(
      "He holds open woodworking sessions and helps participants create practical objects they can take home or donate locally.",
      "Он проводит открытые занятия по дереву, помогая создавать полезные вещи для дома или в подарок местным жителям.",
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
      "Просветитель по компостированию",
      "Educadora de compostaje vecinal",
    ),
    reason: text(
      "Residents nominated her for making everyday waste reduction understandable, friendly and practical.",
      "Жители предложили её за понятный, дружелюбный и практичный подход к сокращению бытовых отходов.",
      "Los vecinos la propusieron por hacer que reducir los residuos cotidianos resulte comprensible, cercano y práctico.",
    ),
    qualities: text(
      "Approachable, inventive and attentive to everyday constraints.",
      "Открытая к общению, изобретательная, учитывает повседневные трудности.",
      "Cercana, creativa y atenta a las dificultades cotidianas.",
    ),
    contribution: text(
      "She helps households start small compost bins and shares the resulting soil with a neighbourhood planting group.",
      "Она помогает семьям завести небольшие компостеры, а полученную почву передаёт группе озеленения района.",
      "Ayuda a las familias a iniciar pequeños compostadores y comparte la tierra obtenida con un grupo de jardinería vecinal.",
    ),
  },
  {
    id: "demo-malik-sow",
    firstName: "Malik",
    lastName: "Sow",
    country: "SN",
    portraitIndex: 12,
    activity: text(
      "Community sports mentor",
      "Спортивный наставник сообщества",
      "Mentor deportivo comunitario",
    ),
    reason: text(
      "Families nominated him for making sport a welcoming meeting place for young people with different backgrounds and abilities.",
      "Семьи предложили его за спортивное пространство, открытое молодым людям с разным опытом и возможностями.",
      "Las familias lo propusieron por hacer del deporte un lugar de encuentro para jóvenes con distintos orígenes y capacidades.",
    ),
    qualities: text(
      "Fair-minded, energetic and quick to include someone standing on the sidelines.",
      "Справедливый, энергичный, умеет вовлечь того, кто остался в стороне.",
      "Justo, enérgico y atento a incluir a quienes se quedan al margen.",
    ),
    contribution: text(
      "He organises mixed-ability games, repairs shared equipment and invites older players to mentor new participants.",
      "Он организует игры для разных уровней подготовки, чинит общий инвентарь и приглашает опытных игроков поддерживать новичков.",
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
      "Хранительница местных семян",
      "Guardiana de semillas comunitarias",
    ),
    reason: text(
      "Local growers nominated her for protecting everyday gardening knowledge and sharing it freely with new neighbours.",
      "Местные садоводы предложили её за сохранение практических знаний и открытый обмен ими с новыми соседями.",
      "Los horticultores locales la propusieron por conservar los conocimientos cotidianos del cultivo y compartirlos con nuevos vecinos.",
    ),
    qualities: text(
      "Thoughtful, methodical and generous with knowledge.",
      "Вдумчивая, последовательная, щедро делится знаниями.",
      "Reflexiva, metódica y generosa con sus conocimientos.",
    ),
    contribution: text(
      "She records the stories behind shared seeds and hosts seasonal exchanges where experienced growers guide first-time gardeners.",
      "Она записывает истории семян и проводит сезонные обмены, на которых опытные садоводы помогают начинающим.",
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
      "Организатор библиотеки инструментов",
      "Organizador de una biblioteca de herramientas",
    ),
    reason: text(
      "Borrowers nominated him for making practical tools and patient guidance available to people who cannot buy their own equipment.",
      "Посетители предложили его за доступ к инструментам и терпеливую помощь тем, кто не может купить собственное оборудование.",
      "Los usuarios lo propusieron por facilitar herramientas y orientación paciente a quienes no pueden comprar su propio equipo.",
    ),
    qualities: text(
      "Dependable, welcoming and committed to sharing fairly.",
      "Надёжный, приветливый, стремится к справедливому обмену.",
      "Fiable, acogedor y comprometido con un acceso justo.",
    ),
    contribution: text(
      "He maintains donated tools, explains safe handling and brings neighbours together for small repair projects.",
      "Он обслуживает подаренные инструменты, объясняет безопасное использование и объединяет соседей для небольших ремонтных проектов.",
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
      "Координатор помощи новым соседям",
      "Coordinadora de bienvenida vecinal",
    ),
    reason: text(
      "New residents nominated her for helping them feel part of the neighbourhood through ordinary acts of welcome.",
      "Новые жители предложили её за простые знаки внимания, которые помогают почувствовать себя частью района.",
      "Los nuevos residentes la propusieron por ayudarles a sentirse parte del barrio mediante gestos cotidianos de bienvenida.",
    ),
    qualities: text(
      "Kind, discreet and good at making introductions without pressure.",
      "Добрая, тактичная, умеет знакомить людей без давления.",
      "Amable, discreta y hábil para conectar a las personas sin presionarlas.",
    ),
    contribution: text(
      "She hosts conversation tables and pairs newcomers with volunteer neighbours for visits to libraries and local services.",
      "Она проводит разговорные встречи и знакомит новых жителей с волонтёрами для совместных визитов в библиотеки и местные службы.",
      "Organiza mesas de conversación y conecta a recién llegados con vecinos voluntarios para visitar bibliotecas y servicios locales.",
    ),
  },
  {
    id: "demo-anil-kharel",
    firstName: "Anil",
    lastName: "Kharel",
    country: "NP",
    portraitIndex: 16,
    activity: text(
      "Walking-route caretaker",
      "Смотритель пешеходных маршрутов",
      "Cuidador de rutas peatonales",
    ),
    reason: text(
      "Neighbours nominated him for the patient work of keeping shared paths welcoming and helping travellers find their way.",
      "Соседи предложили его за терпеливую заботу об общих тропах и помощь людям в поиске пути.",
      "Sus vecinos lo propusieron por cuidar con paciencia los caminos compartidos y ayudar a los caminantes a orientarse.",
    ),
    qualities: text(
      "Steady, observant and generous with practical advice.",
      "Последовательный, наблюдательный, щедрый на полезные советы.",
      "Constante, observador y generoso con sus consejos prácticos.",
    ),
    contribution: text(
      "He coordinates small path-care days, documents spots needing attention and helps young volunteers learn to care for common spaces.",
      "Он организует дни ухода за тропами, отмечает проблемные участки и учит молодых волонтёров заботиться об общих пространствах.",
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
      "Ведущая встреч личных историй",
      "Facilitadora de relatos comunitarios",
    ),
    reason: text(
      "Participants nominated her for creating a thoughtful space where neighbours can share experiences and listen without judgement.",
      "Участники предложили её за пространство, в котором соседи делятся опытом и слушают друг друга без осуждения.",
      "Los participantes la propusieron por crear un espacio donde los vecinos comparten sus experiencias y escuchan sin juzgar.",
    ),
    qualities: text(
      "Attentive, reflective and careful with other people's trust.",
      "Внимательная, вдумчивая, бережно относится к доверию других.",
      "Atenta, reflexiva y cuidadosa con la confianza de los demás.",
    ),
    contribution: text(
      "She hosts story circles and helps residents make consent-based audio keepsakes for their families.",
      "Она проводит встречи историй и с согласия участников помогает создавать семейные аудиовоспоминания.",
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
      "Наставник по ремонту велосипедов",
      "Mentor de reparación de bicicletas",
    ),
    reason: text(
      "Young riders nominated him for making bicycle maintenance an approachable skill and a chance to help one another.",
      "Молодые велосипедисты предложили его за доступное обучение ремонту и возможность помогать друг другу.",
      "Jóvenes ciclistas lo propusieron por hacer del mantenimiento de bicicletas una habilidad accesible y una oportunidad de ayudarse.",
    ),
    qualities: text(
      "Patient, upbeat and generous with hands-on guidance.",
      "Терпеливый, жизнерадостный, щедро помогает на практике.",
      "Paciente, optimista y generoso con la ayuda práctica.",
    ),
    contribution: text(
      "He restores donated bicycles with learners and runs simple maintenance sessions where everyone practises the skills themselves.",
      "Вместе с учениками он восстанавливает подаренные велосипеды и проводит занятия, на которых каждый пробует ремонт своими руками.",
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
      "Координатор соседских обедов",
      "Coordinadora de comidas vecinales",
    ),
    reason: text(
      "Neighbours nominated her for turning shared meals into a dependable source of companionship and practical support.",
      "Соседи предложили её за общие обеды, ставшие надёжным источником общения и повседневной помощи.",
      "Sus vecinos la propusieron por convertir las comidas compartidas en una fuente constante de compañía y apoyo práctico.",
    ),
    qualities: text(
      "Warm, reliable and attentive to people who hesitate to ask for help.",
      "Душевная, надёжная, внимательная к тем, кто стесняется просить о помощи.",
      "Cálida, fiable y atenta a quienes dudan en pedir ayuda.",
    ),
    contribution: text(
      "She coordinates cooking rotas and invites older residents to share favourite recipes with younger volunteers.",
      "Она распределяет дежурства на кухне и приглашает пожилых жителей делиться любимыми рецептами с молодыми волонтёрами.",
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
  return {
    ...profile,
    supporters: makeSupporters(
      supporterCounts
        .slice(0, index)
        .reduce((total, value) => total + value, 0),
      count,
    ),
  };
});
