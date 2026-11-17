import type { SimaQuizQuestion } from "@/lib/sima/quiz"

type Practice = [question: string, options: string[], correctIndex: number, explanation: string]

const PRACTICE: Record<string, Practice[]> = {
  addition: [
    ["What is 45 + 38?", ["73", "83", "84", "93"], 1, "Add the ones: 5 + 8 = 13, carry 1. Add the tens: 4 + 3 + 1 = 8. The answer is 83."],
    ["What is 120 + 80?", ["190", "200", "210", "220"], 1, "120 plus 80 makes 200."],
    ["Which sum is equal to 50?", ["20 + 20", "25 + 25", "30 + 30", "10 + 30"], 1, "25 plus 25 is 50."],
  ],
  subtraction: [
    ["What is 90 - 35?", ["45", "55", "65", "125"], 1, "Taking 35 away from 90 leaves 55."],
    ["What is 100 - 1?", ["98", "99", "101", "89"], 1, "One less than 100 is 99."],
    ["Which operation undoes adding 7?", ["Add 7 again", "Subtract 7", "Multiply by 7", "Divide by 7"], 1, "Subtraction is the opposite of addition."],
  ],
  numberwords: [
    ["How do we write 45 in words?", ["Fourteen", "Forty-five", "Fifty-four", "Four five"], 1, "4 tens is forty and 5 ones is five."],
    ["How do we write 13 in words?", ["Thirty", "Thirteen", "Three", "Thirty-one"], 1, "13 is written thirteen."],
    ["Which word means 20?", ["Two", "Twelve", "Twenty", "Two hundred"], 2, "Twenty is 2 tens."],
  ],
  numberfigures: [
    ["How do we write \"sixty-two\" in figures?", ["26", "62", "602", "620"], 1, "Sixty is 60 and two is 2, so 62."],
    ["How do we write \"one hundred\" in figures?", ["10", "100", "1000", "1100"], 1, "One hundred is written 100."],
    ["How do we write \"thirty\" in figures?", ["13", "30", "33", "300"], 1, "Thirty is 3 tens, so 30."],
  ],
  roman: [
    ["Which Roman numeral means 5?", ["I", "V", "X", "L"], 1, "V stands for 5."],
    ["What is X in our numbers?", ["5", "10", "50", "100"], 1, "X stands for 10."],
    ["What number is IX?", ["6", "9", "11", "15"], 1, "I before X means 1 less than 10, which is 9."],
  ],
  evenodd: [
    ["Which of these is an even number?", ["7", "13", "18", "21"], 2, "Even numbers can be shared into two equal groups, and 18 can."],
    ["Which of these is an odd number?", ["4", "10", "16", "19"], 3, "Odd numbers leave 1 over when shared by 2."],
    ["What is the next even number after 8?", ["9", "10", "11", "12"], 1, "Even numbers go up by 2."],
  ],
  multiplication: [
    ["What is 6 x 4?", ["10", "20", "24", "28"], 2, "Six groups of 4 make 24."],
    ["What is 5 x 10?", ["15", "40", "50", "55"], 2, "Five tens make 50."],
    ["Multiplication is the same as repeated what?", ["Subtraction", "Addition", "Division", "Counting back"], 1, "3 x 4 is 4 + 4 + 4."],
  ],
  lettersounds: [
    ["How many letters are in the English alphabet?", ["24", "25", "26", "27"], 2, "The English alphabet has 26 letters."],
    ["Which word begins with the sound of the letter b?", ["Cat", "Ball", "Sun", "Pen"], 1, "Ball begins with the b sound."],
    ["Which of these is a letter of the alphabet?", ["7", "M", "?", "+"], 1, "M is a letter."],
  ],
  vowels: [
    ["Which of these is a vowel?", ["B", "C", "E", "T"], 2, "The vowels are a, e, i, o and u."],
    ["Which of these is a consonant?", ["A", "I", "O", "D"], 3, "D is a consonant; the vowels are a, e, i, o and u."],
    ["How many vowels are in the word \"cat\"?", ["0", "1", "2", "3"], 1, "Only the letter a is a vowel in cat."],
  ],
  aan: [
    ["Which sentence is correct?", ["I have a apple.", "I have an apple.", "I have an dog.", "I have a elephant."], 1, "Use an before a vowel sound, such as apple."],
    ["Which is correct?", ["an book", "a book", "an table", "a egg"], 1, "Book begins with a consonant, so we use a."],
    ["Fill the gap: She sees ___ owl.", ["a", "an", "the", "two"], 1, "Owl begins with a vowel sound, so we use an."],
  ],
  magice: [
    ["What does the magic e do to the word \"cap\"?", ["Makes it cape", "Makes it cop", "Makes it cup", "Nothing"], 0, "Adding e makes the a say its name, so cap becomes cape."],
    ["Which word has a magic e?", ["Cat", "Bike", "Pig", "Sun"], 1, "Bike ends in a silent e that makes the i say its name."],
    ["What does the magic e make the vowel do?", ["Disappear", "Say its name", "Become a consonant", "Say nothing"], 1, "The vowel says its own name."],
  ],
  letterwords: [
    ["Which is a 3-letter word?", ["At", "Dog", "Bird", "Apple"], 1, "Dog has three letters."],
    ["Which is a 2-letter word?", ["Is", "Cat", "Frog", "Book"], 0, "Is has two letters."],
    ["How many letters are in the word \"fish\"?", ["2", "3", "4", "5"], 2, "F, i, s, h makes four letters."],
  ],
  nouns: [
    ["Which word is a noun?", ["Run", "Happy", "Teacher", "Quickly"], 2, "A noun names a person, place or thing."],
    ["Which of these names a place?", ["School", "Jump", "Blue", "Slowly"], 0, "School is a place, so it is a noun."],
    ["Which of these names an animal?", ["Dance", "Goat", "Soft", "Sing"], 1, "A goat is an animal, so it is a noun."],
  ],
  poem: [
    ["Words that sound alike at the end of lines are called what?", ["Rhymes", "Nouns", "Vowels", "Numbers"], 0, "Rhymes sound the same at the end, like cat and hat."],
    ["Which pair of words rhymes?", ["Cat and hat", "Dog and sun", "Pen and book", "Bed and fish"], 0, "Cat and hat end with the same sound."],
    ["A poem is usually written in what?", ["Lines", "Numbers", "Tables", "Maps"], 0, "A poem is written in lines, often in verses."],
  ],
  plurals: [
    ["What is the plural of \"cat\"?", ["Cat", "Cats", "Cates", "Cat's"], 1, "Add s to show more than one."],
    ["Which word means more than one?", ["Book", "Pen", "Dogs", "Sun"], 2, "Dogs ends in s, so it means more than one."],
    ["Fill the gap: Two ___ are in the tree.", ["bird", "birds", "birdes", "bird's"], 1, "Two means more than one, so we add s."],
  ],
  pronouns: [
    ["Which word is a pronoun?", ["Table", "She", "Run", "Green"], 1, "A pronoun takes the place of a noun."],
    ["Fill the gap: Ada is kind. ___ helps her mother.", ["He", "She", "It", "They"], 1, "Ada is a girl, so we use she."],
    ["Which pronoun can replace \"the boys\"?", ["He", "She", "They", "It"], 2, "They is used for more than one person."],
  ],
  rates: [
    ["A car travels 120 km in 2 hours. What is its average speed?", ["30 km per hour", "60 km per hour", "120 km per hour", "240 km per hour"], 1, "Divide distance by time: 120 divided by 2 is 60."],
    ["Three notebooks cost 600. What is the cost of one notebook?", ["100", "150", "200", "300"], 2, "Divide the total cost by the number of notebooks."],
    ["A tap fills 5 litres each minute. How much water flows in 4 minutes?", ["9 litres", "10 litres", "15 litres", "20 litres"], 3, "Multiply the rate by the time: 5 times 4 is 20."],
  ],
  fractions: [
    ["What is one half plus one quarter?", ["One quarter", "One half", "Three quarters", "One"], 2, "One half is two quarters; adding another quarter gives three quarters."],
    ["Simplify the ratio 6 to 9.", ["2 to 3", "3 to 2", "1 to 3", "6 to 3"], 0, "Divide both parts of the ratio by their common factor, 3."],
    ["Share 20 in the ratio 1 to 3. What is the smaller share?", ["4", "5", "10", "15"], 1, "There are four equal parts. Each part is 20 divided by 4, which is 5."],
  ],
  pythagoras: [
    ["A right triangle has perpendicular sides 3 cm and 4 cm. What is the hypotenuse?", ["5 cm", "6 cm", "7 cm", "12 cm"], 0, "The squares of 3 and 4 add to 25; the square root of 25 is 5."],
    ["Where is the hypotenuse in a right triangle?", ["Opposite the smallest angle", "Opposite the right angle", "Along either shorter side", "Inside the triangle"], 1, "The hypotenuse is the longest side, opposite the right angle."],
    ["Which kind of triangle can use Pythagoras' theorem?", ["Any triangle", "Only equilateral triangles", "Right triangles", "Only isosceles triangles"], 2, "Pythagoras' theorem relates the three sides of a right triangle."],
  ],
  angles: [
    ["What is the sum of angles on a straight line?", ["90 degrees", "180 degrees", "270 degrees", "360 degrees"], 1, "A straight angle measures 180 degrees."],
    ["How do corresponding angles compare when a transversal crosses parallel lines?", ["They are equal", "They always total 90 degrees", "One is always double the other", "They have no relationship"], 0, "Corresponding angles are equal when the two lines are parallel."],
    ["Which angle is acute?", ["45 degrees", "90 degrees", "120 degrees", "180 degrees"], 0, "An acute angle is greater than zero and less than 90 degrees."],
  ],
  equations: [
    ["A number doubled and then increased by 3 gives 11. What is the number?", ["3", "4", "5", "7"], 1, "Subtract 3 from 11, then divide 8 by 2 to get 4."],
    ["A number increased by 7 gives 12. What is the number?", ["5", "7", "12", "19"], 0, "Subtract 7 from both sides to find the unknown number: 5."],
    ["Which operation reverses multiplication by 3 when solving an equation?", ["Add 3", "Subtract 3", "Divide by 3", "Multiply by 3 again"], 2, "Division is the inverse of multiplication."],
  ],
  sequences: [
    ["What comes next in the sequence 3, 7, 11, 15?", ["16", "18", "19", "20"], 2, "Each term increases by 4; the next term is 19."],
    ["What is the common ratio of the sequence 2, 6, 18, 54?", ["2", "3", "6", "9"], 1, "Divide a term by the preceding term: 6 divided by 2 is 3."],
    ["What is the sum of the first four positive whole numbers?", ["6", "8", "10", "12"], 2, "Adding 1, 2, 3 and 4 gives 10."],
  ],
  surds: [
    ["What is the simplest form of the square root of 12?", ["2 times the square root of 3", "3 times the square root of 2", "6", "12"], 0, "12 is 4 times 3. The square root of 4 is 2."],
    ["Which of these is an irrational number?", ["4", "One half", "The square root of 2", "The square root of 9"], 2, "The square root of 2 cannot be expressed as a ratio of integers."],
    ["What is the square root of 5 multiplied by itself?", ["10", "5", "25", "1"], 1, "Multiplying a square root by itself returns the original number."],
  ],
  probability: [
    ["What is the probability of heads when a fair coin is tossed once?", ["One quarter", "One half", "One", "Zero"], 1, "There are two equally likely outcomes, and one is heads."],
    ["A bag contains 3 red balls and 2 blue balls. What is the probability of choosing a red ball?", ["Two fifths", "Three fifths", "Three halves", "One third"], 1, "There are 3 favourable outcomes out of 5 equally likely possibilities."],
    ["What is the probability of an impossible event?", ["Zero", "One half", "One", "Two"], 0, "An impossible event has probability zero."],
  ],
  percentages: [
    ["What is 25 percent of 80?", ["15", "20", "25", "40"], 1, "25 percent is one quarter, and one quarter of 80 is 20."],
    ["A price of 200 is reduced by 10 percent. What is the new price?", ["180", "190", "210", "220"], 0, "Ten percent of 200 is 20; subtract 20 from 200."],
    ["Which fraction is equivalent to 50 percent?", ["One quarter", "One third", "One half", "Three quarters"], 2, "50 out of 100 simplifies to one half."],
  ],
  indices: [
    ["What is 2 raised to the third power?", ["5", "6", "8", "9"], 2, "Multiply three factors of 2 to get 8."],
    ["When multiplying powers with the same base, what happens to the exponents?", ["They are added", "They are subtracted", "They are divided", "They stay unchanged"], 0, "Multiplication of powers with the same base adds the exponents."],
    ["What is any nonzero number raised to the power zero?", ["Zero", "One", "The number itself", "Undefined"], 1, "Every nonzero number to the power zero equals one."],
  ],
  circle: [
    ["A circle has radius 7 cm. What is its diameter?", ["3.5 cm", "7 cm", "14 cm", "21 cm"], 2, "The diameter is twice the radius."],
    ["What is the name of a line segment joining two points on a circle?", ["Radius", "Chord", "Tangent", "Arc"], 1, "A chord has both endpoints on the circumference."],
    ["What is the angle in a semicircle?", ["45 degrees", "60 degrees", "90 degrees", "180 degrees"], 2, "An angle subtended by a diameter at the circumference is a right angle."],
  ],
  coordinates: [
    ["What is the horizontal coordinate of the point (3, 5)?", ["3", "5", "8", "2"], 0, "The first coordinate gives the horizontal position."],
    ["How far apart are the points (1, 2) and (4, 2)?", ["2 units", "3 units", "4 units", "5 units"], 1, "The vertical positions are equal, so subtract the horizontal coordinates."],
    ["A line rises 6 units while moving 3 units to the right. What is its gradient?", ["One half", "2", "3", "9"], 1, "Gradient is the vertical change divided by the horizontal change."],
  ],
  mensuration: [
    ["What is the area of a rectangle measuring 6 cm by 4 cm?", ["10 square cm", "20 square cm", "24 square cm", "48 square cm"], 2, "Rectangle area is length multiplied by width."],
    ["A triangle has base 8 cm and perpendicular height 5 cm. What is its area?", ["13 square cm", "20 square cm", "40 square cm", "80 square cm"], 1, "Take half of the product of base and perpendicular height."],
    ["What is the volume of a cube with side length 3 cm?", ["9 cubic cm", "18 cubic cm", "27 cubic cm", "36 cubic cm"], 2, "Multiply the length, width and height, each of which is 3 cm."],
  ],
  formula: [
    ["Distance is speed multiplied by time. How do you find speed from distance and time?", ["Multiply distance by time", "Divide distance by time", "Divide time by distance", "Add distance and time"], 1, "Divide both sides by time to isolate speed."],
    ["A rectangle has area 24 square cm and length 6 cm. What is its width?", ["3 cm", "4 cm", "6 cm", "18 cm"], 1, "Divide area by length to find width."],
    ["What does making a variable the subject of a formula mean?", ["Removing it completely", "Putting it alone on one side", "Squaring every term", "Changing its value"], 1, "Rearrange the formula so the required variable stands alone."],
  ],
  finance: [
    ["What is the simple interest on 1000 at 10 percent per year for 2 years?", ["100", "200", "1100", "1200"], 1, "Ten percent of 1000 is 100 per year; two years earns 200."],
    ["An item costs 500 and sells for 650. What is the profit?", ["100", "150", "500", "1150"], 1, "Profit is selling price minus cost price."],
    ["How is compound interest different from simple interest?", ["It ignores the principal", "It includes interest on earlier interest", "It is always zero", "It has no time period"], 1, "Compound interest is calculated on the growing balance, including earlier interest."],
  ],
  modular: [
    ["What remainder is left when 17 is divided by 5?", ["1", "2", "3", "4"], 1, "Three groups of 5 use 15, leaving 2."],
    ["On a 12-hour clock, what time is 5 hours after 10 o'clock?", ["1 o'clock", "2 o'clock", "3 o'clock", "5 o'clock"], 2, "Counting forward through 12 returns to 1; five hours after 10 is 3."],
    ["Which number has the same remainder as 8 when divided by 3?", ["9", "10", "11", "12"], 2, "Both 8 and 11 leave remainder 2 when divided by 3."],
  ],
  shapes: [
    ["How many sides does a hexagon have?", ["4", "5", "6", "8"], 2, "A hexagon is a six-sided polygon."],
    ["What is the sum of the interior angles of a triangle?", ["90 degrees", "180 degrees", "270 degrees", "360 degrees"], 1, "The three interior angles of any triangle total 180 degrees."],
    ["Which shape has four equal sides and four right angles?", ["Rectangle", "Rhombus", "Square", "Trapezium"], 2, "A square has both equal sides and right angles."],
  ],
  statistics: [
    ["What is the mean of 2, 4 and 6?", ["2", "3", "4", "6"], 2, "Add the values to get 12, then divide by 3."],
    ["What is the median of 1, 3, 8, 9 and 12?", ["3", "8", "9", "12"], 1, "The median is the middle value in the ordered list."],
    ["What is the mode of 2, 3, 3, 4 and 5?", ["2", "3", "4", "5"], 1, "The mode is the value occurring most often."],
  ],
  factors: [
    ["What is the lowest common multiple of 4 and 6?", ["2", "8", "12", "24"], 2, "12 is the smallest positive number divisible by both 4 and 6."],
    ["What is the highest common factor of 12 and 18?", ["3", "6", "12", "18"], 1, "6 is the largest number that divides both 12 and 18 exactly."],
    ["Which of these is a factor of 15?", ["2", "4", "5", "6"], 2, "15 divided by 5 is exactly 3."],
  ],
}

export function getMathQuiz(title: string, lessonId: string): SimaQuizQuestion[] {
  const topic = /names\s*&\s*sounds/i.test(title) ? "lettersounds"
    : /consonant|vowel/i.test(title) ? "vowels"
    : /"a"\s*or\s*"an"|\ba\b.*\bor\b.*\ban\b/i.test(title) ? "aan"
    : /magical/i.test(title) ? "magice"
    : /letter words/i.test(title) ? "letterwords"
    : /pronoun/i.test(title) ? "pronouns"
    : /\bnouns?\b/i.test(title) ? "nouns"
    : /\bpoem\b/i.test(title) ? "poem"
    : /adding s\b/i.test(title) ? "plurals"
    : /\baddition\b/i.test(title) ? "addition"
    : /subtra/i.test(title) ? "subtraction"
    : /in words/i.test(title) ? "numberwords"
    : /in figures/i.test(title) ? "numberfigures"
    : /roman/i.test(title) ? "roman"
    : /even numbers/i.test(title) ? "evenodd"
    : /multiplication/i.test(title) ? "multiplication"
    : /pythagoras/i.test(title) ? "pythagoras"
    : /angle|parallel/i.test(title) ? "angles"
    : /fraction|\bratios?\b/i.test(title) ? "fractions"
    : /rate/i.test(title) ? "rates"
    : /lcm|hcf|factor/i.test(title) ? "factors"
    : /statistic/i.test(title) ? "statistics"
    : /plane|shape/i.test(title) ? "shapes"
    : /sequence|series/i.test(title) ? "sequences"
    : /surd/i.test(title) ? "surds"
    : /probab/i.test(title) ? "probability"
    : /percent/i.test(title) ? "percentages"
    : /indic|logarithm/i.test(title) ? "indices"
    : /coordinate/i.test(title) ? "coordinates"
    : /circle/i.test(title) ? "circle"
    : /mensuration/i.test(title) ? "mensuration"
    : /formular?/i.test(title) ? "formula"
    : /financial|interest/i.test(title) ? "finance"
    : /modular/i.test(title) ? "modular"
    : /equation/i.test(title) ? "equations" : null
  if (!topic) throw new Error(`Add practice questions for lesson topic: ${title}`)
  return PRACTICE[topic].map(([question, options, correctIndex, explanation], index) => ({
    id: `${lessonId}-q${index + 1}`, question, options, correctIndex, explanation,
  }))
}
