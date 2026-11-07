const COMMON = [
  "password", "123456", "qwerty", "letmein", "welcome", "admin", "iloveyou", "monkey",
  "dragon", "football", "abc123", "login", "princess", "sunshine", "master", "pogi", "maria",
];

export type Strength = {
  score: number; // 0-100
  label: "Very weak" | "Weak" | "Okay" | "Strong" | "Very strong";
  tips: string[];
  crackTime: string;
};

function formatTime(seconds: number): string {
  if (seconds < 1) return "instantly";
  const units: [number, string][] = [
    [60, "seconds"], [60, "minutes"], [24, "hours"], [365, "days"], [100, "years"], [Infinity, "centuries"],
  ];
  let v = seconds;
  for (const [div, name] of units) {
    if (v < div) return `about ${Math.max(1, Math.round(v))} ${name}`;
    v /= div;
  }
  return "centuries";
}

export function evaluate(pw: string): Strength {
  const tips: string[] = [];
  if (!pw) return { score: 0, label: "Very weak", tips: ["Type a practice password to see how it scores."], crackTime: "instantly" };

  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 32;

  let bits = pw.length * Math.log2(Math.max(pool, 2));

  const lower = pw.toLowerCase();
  const hasCommon = COMMON.some((c) => lower.includes(c));
  if (hasCommon) { bits *= 0.4; tips.push("Contains a very common word or pattern."); }
  if (/(.)\1{2,}/.test(pw)) { bits *= 0.7; tips.push("Avoid repeating the same character."); }
  if (/(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|qwer|asdf|zxcv)/i.test(pw)) { bits *= 0.6; tips.push("Avoid keyboard or number sequences."); }
  if (/^[a-zA-Z]+[0-9]{1,4}[!@#$%]?$/.test(pw)) { bits *= 0.75; tips.push("Word + number + symbol is the first pattern attackers try."); }
  if (pw.length < 12) tips.push("Use at least 12 characters. Length matters most.");
  if (pw.length >= 12 && !/\s|-/.test(pw) && pw.length < 16) tips.push("A passphrase of 4+ random words is easy to remember and very strong.");

  const score = Math.max(0, Math.min(100, Math.round((bits / 80) * 100)));
  // Assume an attacker with a fast offline setup: 10 billion guesses per second.
  const seconds = Math.pow(2, bits) / 1e10;
  const label = score < 25 ? "Very weak" : score < 45 ? "Weak" : score < 65 ? "Okay" : score < 85 ? "Strong" : "Very strong";
  if (!tips.length) tips.push("Nice. Also use a unique password for every account, and turn on two-factor sign-in.");
  return { score, label, tips, crackTime: formatTime(seconds) };
}

export type Question = { a: string; b: string; answer: "a" | "b"; why: string };

// Each entry is one strong and one weak password. The side they appear on is randomized every round.
const BANK: { strong: string; weak: string; why: string }[] = [
  { strong: "violet-tractor-sandwich-moon", weak: "P@ssw0rd123", why: "Length and randomness beat clever substitutions. 'P@ssw0rd' is on every cracking list." },
  { strong: "Kj9$vL2#qX", weak: "Summer2024!", why: "Summer2024! follows the word + year + symbol pattern attackers try first. The random one has no pattern." },
  { strong: "lantern-biscuit-orbit-paddle", weak: "ilovemydog", why: "Four unrelated words are longer and far less guessable than a short personal phrase." },
  { strong: "purple-anchor-mango-drizzle", weak: "Tr0ub4dor&3", why: "Swapping letters for symbols is a pattern crackers already model. Four random words add real length." },
  { strong: "7-pelican-lamp-orbit-61", weak: "Maria1998", why: "Names and birth years are easy to find online and easy to guess." },
  { strong: "tiger-window-cello-fabric-nine", weak: "Tiger123!", why: "A word, a number sequence, and a symbol on the end is the first pattern tried. The random words are much longer." },
  { strong: "xQ4#m9Lp2vTz", weak: "Qwerty@2024", why: "Keyboard patterns like 'qwerty' are in every cracking list, even with a symbol and a year added." },
  { strong: "river-clock-pepper-ladder", weak: "Rivers1234", why: "A real word plus 1234 falls quickly. Four random words make a long password you can still remember." },
  { strong: "mT8!rB3&kQ7w", weak: "Welcome1", why: "Welcome1 is short, uses a dictionary word, and is one of the most common passwords. Random characters have no pattern to guess." },
  { strong: "walnut_harbor_sketch_velvet", weak: "W@lnut2023", why: "Replacing letters with symbols and adding a year is a known trick. Long random words beat it." },
  { strong: "jZ2$pL8@nV5!xC", weak: "Admin@123", why: "Admin@123 is a classic default-style password that attackers try early. The other one is long and random." },
  { strong: "gravel-teacup-mosaic-lunar-fox", weak: "iloveyou2024", why: "Common phrases with a year are guessed in seconds. Five random words are far harder." },
  { strong: "9Fh!kw3Rz@Lq", weak: "Passw0rd!", why: "Passw0rd! is a lightly disguised 'password'. The random string has no meaning to guess." },
  { strong: "bamboo ferry copper alarm", weak: "Jessica2001", why: "Names plus birth years are easy to find or guess. A passphrase of random words is stronger and easier to remember." },
  { strong: "sP4$wQ8!eT2#", weak: "Football99", why: "Hobby words with numbers appear in cracking lists. Random characters do not." },
];

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds a new round of quiz questions: random questions, random order,
 * and the strong password lands on a random side. Questions in `exclude`
 * (the ones from the previous round) are skipped so a retry feels fresh.
 */
export function buildRound(count = 5, exclude: string[] = []): { questions: Question[]; keys: string[] } {
  let pool = BANK.filter((q) => !exclude.includes(q.strong));
  if (pool.length < count) pool = BANK;
  const picked = shuffle(pool).slice(0, count);
  const questions = picked.map((q) => {
    const strongOnB = Math.random() < 0.5;
    return {
      a: strongOnB ? q.weak : q.strong,
      b: strongOnB ? q.strong : q.weak,
      answer: (strongOnB ? "b" : "a") as "a" | "b",
      why: q.why,
    };
  });
  return { questions, keys: picked.map((q) => q.strong) };
}