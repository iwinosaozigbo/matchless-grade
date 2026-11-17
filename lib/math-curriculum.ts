export type MathLevel = {
  id: string
  stage: string
  grades: string
  tagline: string
  color: "sun" | "mint" | "brand"
  /** Defaults to Mathematics. English stages are kept out of the public Mathematics curriculum. */
  subject?: "english"
  topics: string[]
  /** Optional individually assigned recorded video lessons. */
  videos?: { id: string; title: string }[]
  /** Optional free sample lesson (YouTube link) shown as a "free class" hook. */
  freeClass?: { label: string; href: string }
  /** Recorded Matchless Grade lessons from the stage's YouTube playlist. */
  playlist?: {
    href: string
    videos: { id: string; title: string }[]
  }
}

/**
 * Mathematics broken down by school stage. Senior Secondary topics come from the
 * Matchless Grade syllabus (the recorded lesson list); Upper Basic and Junior
 * Secondary follow the standard Nigerian UBE / secondary curriculum.
 */
export const MATH_LEVELS: MathLevel[] = [
  {
    id: "nursery-2-basic-1",
    stage: "Nursery 2 & Basic 1",
    grades: "Nursery 2 · Basic 1",
    tagline: "Counting, shapes and first number sense, learned through play.",
    color: "sun",
    topics: [
      "Counting to 100",
      "Number recognition & writing",
      "Comparing & ordering numbers",
      "Addition & subtraction basics",
      "Number patterns",
      "Shapes & colours",
      "Position & direction",
      "Measuring: long, short, heavy, light",
      "Money & everyday sums",
    ],
  },
  {
    id: "basic-2-3",
    stage: "Basic 2-3",
    grades: "Basic 2–3 · Primary 2–3",
    tagline: "Confident addition, subtraction and times tables.",
    color: "brand",
    playlist: {
      href: "https://www.youtube.com/playlist?list=PLGe3vWv-jsNA",
      videos: [
        { id: "ruFilDCAOrc", title: "Basic 2 & 3 Lesson 1 Addition of Numbers" },
        { id: "qkXYwl_EHKg", title: "Basic 2 & 3 Lesson 2 Subtraction of Numbers" },
        { id: "nYzopNOauZY", title: "Basic 2 & 3 Lesson 3 Writing Numbers In Words" },
        { id: "IyzTbdZUnMU", title: "Basic 2 & 3 Lesson 4 Writing Numbers In Figures" },
        { id: "ve7oVQdsKFE", title: "Basic 2 & 3 Lesson 5 Roman Numerals" },
        { id: "w8n5NkhFn3w", title: "Basic 2 & 3 Lesson 6 Even Numbers & Odd Numbers" },
        { id: "IbdQfAoJcys", title: "Basic 2 & 3 Lesson 7 Multiplication of Numbers" },
      ],
    },
    topics: [
      "Place value up to 1,000",
      "Addition & subtraction with carrying",
      "Multiplication tables",
      "Division as sharing",
      "Simple fractions",
      "2D & 3D shapes",
      "Time & the calendar",
      "Money & change",
      "Length, mass & capacity",
      "Reading simple charts",
    ],
  },
  {
    id: "upper-basic",
    stage: "Upper Basic",
    grades: "Basic 4–6 · Primary 4–6",
    tagline: "Strong number sense and the building blocks of maths.",
    color: "mint",
    playlist: {
      href: "https://www.youtube.com/playlist?list=PLd8J3EgAQ7Ds",
      videos: [
        { id: "LBphvyHNGNE", title: "LCM & HCF" },
        { id: "N8jjvAalhRM", title: "Statistics" },
      ],
    },
    topics: [
      "Whole numbers & place value",
      "Fractions & decimals",
      "Multiplication & division",
      "LCM & HCF",
      "Money & percentages",
      "Shapes, angles & symmetry",
      "Length, weight & capacity",
      "Perimeter & area",
      "Introduction to algebra",
      "Pictograms & bar charts",
    ],
  },
  {
    id: "junior-secondary",
    stage: "Junior Secondary",
    grades: "JSS 1–3",
    tagline: "Bridging arithmetic into real algebra and geometry.",
    color: "brand",
    playlist: {
      href: "https://www.youtube.com/playlist?list=PLFiLrPxhNCIo",
      videos: [
        { id: "kobvhA9NbRQ", title: "Plane Shapes (Part 1)" },
        { id: "MZBnLYi0nwU", title: "Plane Shapes (Part 2)" },
        { id: "6lDWYOYmW5Q", title: "Questions on Plane Shapes" },
      ],
    },
    topics: [
      "Number bases",
      "Fractions, decimals & approximation",
      "Indices",
      "Algebraic expressions",
      "Simple & simultaneous equations",
      "Ratio, proportion & rate",
      "Percentages & simple interest",
      "Plane geometry & angles",
      "Mensuration: area & volume",
      "Statistics & probability",
    ],
  },
  {
    id: "senior-secondary",
    stage: "Senior Secondary",
    grades: "SSS 1–3",
    tagline: "Exam-ready mastery for WAEC, NECO, JAMB & beyond.",
    color: "sun",
    videos: [
      { id: "AUAsj_Uvt7M", title: "Linear Equation 3" },
      { id: "tEZae848NZ4", title: "Sequences and Series A" },
      { id: "HSAesR4C_e8", title: "Sequences and Series B" },
      { id: "nrFavQF242k", title: "Surd" },
      { id: "r0b4ZP5zrqQ", title: "Probability A" },
      { id: "_LsGPV-8Dz8", title: "Probability B" },
      { id: "aLGHw_iB_BU", title: "Percentage A" },
      { id: "aLGHw_iB_BU", title: "Percentage B" },
      { id: "E7yvrzFJAVs", title: "Indices A" },
      { id: "8LowX2CvxnY", title: "Indices B" },
      { id: "eJm3ui0yXqI", title: "Indices C" },
      { id: "-xRkn6rk5JA", title: "Indices D" },
      { id: "49-etBJkPig", title: "Circle A" },
      { id: "Jy3p9Y-fF5c", title: "Circle B" },
      { id: "fW50pPvkSko", title: "Circle C" },
      { id: "-xRkn6rk5JA", title: "Circle D" },
      { id: "-g4uyH201nw", title: "Coordinate Geometry A" },
      { id: "feVlomIJFf4", title: "Coordinate Geometry B" },
      { id: "vSlF3m5KrOA", title: "Mensuration A" },
      { id: "sCvLwQ-DjhU", title: "Mensuration B" },
      { id: "DvI6Th45vYg", title: "Mensuration C" },
      { id: "LTu6qz0B3N4", title: "Mensuration D" },
      { id: "U461fkBhaBk", title: "Mensuration E" },
      { id: "Ebh_lOLzqsE", title: "Mensuration F" },
      { id: "VCt3NceIuD0", title: "Mensuration G" },
      { id: "OBfCJAvt-kg", title: "Mensuration H" },
      { id: "smrsOvUpYBI", title: "Subject of Formula A" },
      { id: "eTtSwmlShbE", title: "Subject of Formula B" },
      { id: "V9Z2_kxWAcc", title: "Financial Mathematics A" },
      { id: "px1VfY7W6sw", title: "Financial Mathematics B" },
      { id: "4Kh0p65qHsc", title: "Financial Mathematics C" },
      { id: "koAhs9scN3E", title: "Financial Mathematics D" },
      { id: "mxCdYtMWNxo", title: "Modular Arithmetic A" },
      { id: "Ei7-R3C4VoM", title: "Modular Arithmetic B" },
    ],
    freeClass: { label: "Watch a free class: Quadratic Equations", href: "https://youtu.be/K14mWrVVRME" },
    topics: [
      "Quadratic equations",
      "Linear equations",
      "Sequences & series",
      "Surds",
      "Indices & logarithms",
      "Probability",
      "Percentages & financial mathematics",
      "Circle geometry",
      "Coordinate geometry",
      "Mensuration",
      "Change of subject of formula",
      "Modular arithmetic",
    ],
  },
]

/** English courses use the same recorded-lesson system as Mathematics but are listed separately. */
export const ENGLISH_LEVELS: MathLevel[] = [
  {
    id: "grade-1-english",
    stage: "Grade 1 English",
    grades: "Grade 1 · 1st Term",
    tagline: "Sounds, letters, words and first grammar for young readers.",
    color: "mint",
    subject: "english",
    playlist: {
      href: "https://www.youtube.com/playlist?list=PLYYGmnPTIpks",
      videos: [
        { id: "hN9pwBlhP9w", title: "Grade 1 Lesson 1 Names & Sounds" },
        { id: "-FfWtvmyxz0", title: "Grade 1 Lesson 2 Consonants, Vowels and Semi Vowels" },
        { id: "8h5ToKTOCVU", title: "Grade 1 Lesson 3 How to Use \"A\" or \"An\"" },
        { id: "kUATZEY-er8", title: "Grade 1 Lesson 4 Magical E" },
        { id: "xxep05kyeGo", title: "Grade 1 Lesson 5 2, 3 & 4 Letter Words" },
        { id: "enw3O-hP0m4", title: "Grade 1 Lesson 6 Nouns" },
        { id: "WfTy0F2107M", title: "Grade 1 Lesson 7 Poem" },
        { id: "DoTi2MaQXBM", title: "Grade 1 Lesson 8 Adding S" },
        { id: "ypC6ftHRqng", title: "Grade 1 Lesson 9 Pronouns" },
      ],
    },
    topics: [
      "Names & sounds of letters",
      "Consonants, vowels & semi vowels",
      "Using a or an",
      "Magical e",
      "2, 3 & 4 letter words",
      "Nouns",
      "Poem",
      "Adding s",
      "Pronouns",
    ],
  },
  {
    id: "grade-2-english",
    stage: "Grade 2 English",
    grades: "Grade 2 · 2nd Term",
    tagline: "Build confident reading and grammar with six short, focused lessons.",
    color: "brand",
    subject: "english",
    playlist: {
      href: "https://www.youtube.com/playlist?list=PLYL3NbMTfvyc",
      videos: [
        { id: "jOAZvj-TxR4", title: "Grade 2 Lesson 1 Possessive Pronouns" },
        { id: "vzNi9R9HzRI", title: "Grade 2 Lesson 2 Synonyms" },
        { id: "avxmCG08ynE", title: "Grade 2 Lesson 3 Gender Words" },
        { id: "kw-I6ojEF9k", title: "Grade 2 Lesson 4 Tion Ending Sound" },
        { id: "3uSFpYp5oAE", title: "Grade 2 Lesson 5 Reflexive Pronouns" },
        { id: "LtZ7_P1B6tw", title: "Grade 2 Lesson 6 Use of Do and Does" },
      ],
    },
    topics: [
      "Possessive pronouns",
      "Synonyms",
      "Gender words",
      "The tion ending sound",
      "Reflexive pronouns",
      "Using do and does",
    ],
  },
]
