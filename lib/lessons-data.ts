export type Flashcard = {
  front: string
  back: string
}

export type QuizQuestion = {
  question: string
  options: string[]
  answer: number
  explanation: string
}

export type Lesson = {
  id: string
  title: string
  blurb: string
  duration: string
  xp: number
  videoId: string
  /** School stage for Matchless Grade playlist lessons (e.g. "Junior Secondary"). */
  stage?: string
  /** Overrides the default /learn/[subject]/[lesson] link (e.g. SIMA Abacus lessons). */
  href?: string
  notes: string[]
  quiz: QuizQuestion[]
  flashcards: Flashcard[]
}

export type Subject = {
  id: string
  title: string
  tagline: string
  color: "brand" | "sun" | "grape" | "mint" | "bubblegum" | "sky"
  image: string
  lessons: Lesson[]
}

/**
 * Video IDs point at well-known, publicly embeddable educational videos.
 * Swap any `videoId` to change the embedded lesson video.
 */
export const SUBJECTS: Subject[] = [
  {
    id: "math",
    title: "Mathematics",
    tagline: "Numbers, patterns and problem solving",
    color: "brand",
    image: "/scene-math.png",
    lessons: [
      {
        id: "solving-equations",
        title: "Solving Equations",
        blurb: "Balance both sides and find the mystery number.",
        duration: "12 min",
        xp: 120,
        videoId: "WUvTyaaNkzM",
        notes: [
          "An equation is like a balance scale — whatever you do to one side, you must do to the other.",
          "To solve 6x - 8 = 2x, move the x-terms together: 6x - 2x = 8, so 4x = 8.",
          "Divide both sides by 4 to get x = 2. Always check by plugging the answer back in!",
          "Inverse operations undo each other: + undoes -, and × undoes ÷.",
        ],
        quiz: [
          {
            question: "Solve for x:  6x - 8 = 2x",
            options: ["x = 1", "x = 2", "x = 4", "x = 8"],
            answer: 1,
            explanation: "6x - 2x = 8 → 4x = 8 → x = 2.",
          },
          {
            question: "What is the inverse operation of multiplication?",
            options: ["Addition", "Subtraction", "Division", "Squaring"],
            answer: 2,
            explanation: "Division undoes multiplication.",
          },
          {
            question: "If x + 7 = 12, what is x?",
            options: ["4", "5", "6", "19"],
            answer: 1,
            explanation: "Subtract 7 from both sides: x = 5.",
          },
          {
            question: "To keep an equation balanced you must…",
            options: [
              "Only change the left side",
              "Do the same thing to both sides",
              "Always divide by x",
              "Remove the equals sign",
            ],
            answer: 1,
            explanation: "Whatever you do to one side, do to the other.",
          },
        ],
        flashcards: [
          { front: "What is a variable?", back: "A letter that stands for an unknown number, like x." },
          { front: "Solve: 4x = 8", back: "x = 2 (divide both sides by 4)." },
          { front: "Inverse of subtraction?", back: "Addition." },
          { front: "First step to solve 6x - 8 = 2x?", back: "Collect x-terms: 6x - 2x = 8." },
          { front: "How do you check an answer?", back: "Substitute it back into the original equation." },
        ],
      },
      {
        id: "fractions-ratios",
        title: "Fractions & Ratios",
        blurb: "Slice the pizza and compare the pieces.",
        duration: "10 min",
        xp: 100,
        videoId: "spUNpyF58BY",
        notes: [
          "A fraction has a numerator (top) and a denominator (bottom).",
          "Equivalent fractions represent the same amount: 1/2 = 2/4 = 3/6.",
          "A ratio compares two quantities, written 2:3 or 2 to 3.",
        ],
        quiz: [
          {
            question: "Which fraction equals 1/2?",
            options: ["2/3", "3/6", "4/10", "5/8"],
            answer: 1,
            explanation: "3/6 simplifies to 1/2.",
          },
          {
            question: "The top number of a fraction is the…",
            options: ["Denominator", "Numerator", "Ratio", "Divisor"],
            answer: 1,
            explanation: "The numerator sits on top.",
          },
          {
            question: "Simplify 4/8.",
            options: ["1/2", "2/3", "1/4", "3/4"],
            answer: 0,
            explanation: "Divide top and bottom by 4 → 1/2.",
          },
        ],
        flashcards: [
          { front: "Numerator?", back: "The top number of a fraction." },
          { front: "Denominator?", back: "The bottom number of a fraction." },
          { front: "Write a ratio of 2 to 5", back: "2:5" },
          { front: "Simplify 6/9", back: "2/3" },
        ],
      },
      {
        id: "geometry-basics",
        title: "Geometry Basics",
        blurb: "Shapes, angles and the space around us.",
        duration: "11 min",
        xp: 110,
        videoId: "fNk_zzaMoSs",
        notes: [
          "A right angle is exactly 90 degrees.",
          "The angles inside a triangle always add up to 180 degrees.",
          "Perimeter is the distance around a shape; area is the space inside it.",
        ],
        quiz: [
          {
            question: "Angles in a triangle add up to…",
            options: ["90°", "180°", "270°", "360°"],
            answer: 1,
            explanation: "Every triangle's interior angles sum to 180°.",
          },
          {
            question: "A right angle measures…",
            options: ["45°", "60°", "90°", "180°"],
            answer: 2,
            explanation: "A right angle is 90°.",
          },
        ],
        flashcards: [
          { front: "Right angle size?", back: "90 degrees." },
          { front: "Triangle angle sum?", back: "180 degrees." },
          { front: "What is perimeter?", back: "The distance around a shape." },
        ],
      },
    ],
  },
  {
    id: "abacus",
    title: "Sima Abacus",
    tagline: "Lightning-fast mental maths with beads",
    color: "sun",
    image: "/scene-abacus.png",
    lessons: [
      {
        id: "mental-maths",
        title: "Mental Maths with the Abacus",
        blurb: "Add numbers in your head — no calculator needed!",
        duration: "6 min",
        xp: 130,
        videoId: "eVoS063TiIE",
        notes: [
          "Sima Abacus teaches mental mathematics — solving sums in your head, fast.",
          "An abacus is a counting frame with sliding beads. In the video the beads are red and green.",
          "You picture the beads in your mind, then move them mentally to add numbers.",
          "Try the video's own challenge: 2 + 3 + 4 + 6 = 15.",
          "The more you practise, the quicker and more confident you become!",
        ],
        quiz: [
          {
            question: "The video asks: what is 2 + 3 + 4 + 6?",
            options: ["13", "14", "15", "16"],
            answer: 2,
            explanation: "2 + 3 = 5, + 4 = 9, + 6 = 15. That's the answer the child gives in the video!",
          },
          {
            question: "What does Sima Abacus mainly teach?",
            options: ["Spelling", "Mental mathematics", "Painting", "Music"],
            answer: 1,
            explanation: "Sima Abacus is all about mental mathematics — calculating in your head.",
          },
          {
            question: "What colour are the abacus beads shown in the video?",
            options: ["Blue and yellow", "Red and green", "Black and white", "Purple and orange"],
            answer: 1,
            explanation: "The children use abacuses with red and green beads.",
          },
          {
            question: "What is an abacus?",
            options: [
              "A type of calculator screen",
              "A counting frame with sliding beads",
              "A math textbook",
              "A drawing board",
            ],
            answer: 1,
            explanation: "An abacus is a frame of rods with beads you slide to count and calculate.",
          },
          {
            question: '"Mental maths" means…',
            options: [
              "Using a calculator",
              "Working sums out in your head",
              "Writing every step on paper",
              "Guessing the answer",
            ],
            answer: 1,
            explanation: "Mental maths is solving problems in your mind, without a calculator.",
          },
        ],
        flashcards: [
          { front: "What is an abacus?", back: "A counting frame with sliding beads used to calculate." },
          { front: "What does Sima Abacus teach?", back: "Mental mathematics — doing sums in your head." },
          { front: "2 + 3 + 4 + 6 = ?", back: "15" },
          { front: "What colour are the beads in the video?", back: "Red and green." },
          { front: "Why practise the abacus?", back: "It makes maths fast, fun and builds confidence." },
        ],
      },
    ],
  },
  {
    id: "science",
    title: "Science",
    tagline: "Experiments, elements and how things work",
    color: "mint",
    image: "/scene-science.png",
    lessons: [
      {
        id: "states-of-matter",
        title: "States of Matter",
        blurb: "Solids, liquids and gases all around us.",
        duration: "9 min",
        xp: 90,
        videoId: "aircAruvnKk",
        notes: [
          "Matter comes in three everyday states: solid, liquid and gas.",
          "Heating can melt a solid into a liquid, then boil it into a gas.",
          "Cooling reverses the process: gas → liquid → solid.",
        ],
        quiz: [
          {
            question: "Which state has a fixed shape?",
            options: ["Solid", "Liquid", "Gas", "Plasma"],
            answer: 0,
            explanation: "Solids hold their shape.",
          },
          {
            question: "Melting turns a solid into a…",
            options: ["Gas", "Liquid", "Plasma", "Crystal"],
            answer: 1,
            explanation: "Melting = solid to liquid.",
          },
        ],
        flashcards: [
          { front: "Three states of matter?", back: "Solid, liquid, gas." },
          { front: "What is melting?", back: "Solid changing into liquid." },
          { front: "What is freezing?", back: "Liquid changing into solid." },
        ],
      },
    ],
  },
  {
    id: "coding",
    title: "Programming",
    tagline: "Tell the computer what to do, step by step",
    color: "sky",
    image: "/scene-coding.png",
    lessons: [
      {
        id: "what-is-code",
        title: "What is Code?",
        blurb: "Give the computer clear instructions.",
        duration: "8 min",
        xp: 90,
        videoId: "kYB8IZa5AuE",
        notes: [
          "Code is a set of instructions a computer follows in order.",
          "A loop repeats instructions so you don't write them over and over.",
          "A variable stores a value you can use later.",
        ],
        quiz: [
          {
            question: "What does a loop do?",
            options: ["Stores data", "Repeats instructions", "Deletes files", "Draws pictures"],
            answer: 1,
            explanation: "Loops repeat a block of instructions.",
          },
          {
            question: "A variable is used to…",
            options: ["Repeat code", "Store a value", "Turn off the computer", "Print paper"],
            answer: 1,
            explanation: "Variables store values.",
          },
        ],
        flashcards: [
          { front: "What is code?", back: "Instructions a computer follows in order." },
          { front: "What is a loop?", back: "Something that repeats instructions." },
          { front: "What is a variable?", back: "A named box that stores a value." },
        ],
      },
    ],
  },
  {
    id: "reading",
    title: "Reading",
    tagline: "Stories, words and the joy of language",
    color: "bubblegum",
    image: "/scene-reading.png",
    lessons: [
      {
        id: "parts-of-a-story",
        title: "Parts of a Story",
        blurb: "Characters, setting and what happens next.",
        duration: "7 min",
        xp: 80,
        videoId: "WUvTyaaNkzM",
        notes: [
          "Characters are the people or creatures in a story.",
          "The setting is where and when the story takes place.",
          "The plot is the sequence of events — beginning, middle and end.",
        ],
        quiz: [
          {
            question: "The setting of a story is…",
            options: ["Who is in it", "Where and when it happens", "The last page", "The title"],
            answer: 1,
            explanation: "Setting = the time and place.",
          },
          {
            question: "The plot is…",
            options: ["The cover art", "The list of words", "What happens in the story", "The author"],
            answer: 2,
            explanation: "Plot is the sequence of events.",
          },
        ],
        flashcards: [
          { front: "Who are characters?", back: "The people or creatures in a story." },
          { front: "What is the setting?", back: "Where and when the story happens." },
          { front: "What is the plot?", back: "The events from beginning to end." },
        ],
      },
    ],
  },
]

export function getSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id)
}

export function getLesson(subjectId: string, lessonId: string) {
  const subject = getSubject(subjectId)
  const lesson = subject?.lessons.find((l) => l.id === lessonId)
  return { subject, lesson }
}

export const ALL_LESSON_IDS = SUBJECTS.flatMap((s) => s.lessons.map((l) => `${s.id}/${l.id}`))
