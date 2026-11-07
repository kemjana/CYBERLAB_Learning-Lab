export const FLAG_OPTIONS = [
  { id: "sender", label: "Sender address looks fake or look-alike" },
  { id: "urgency", label: "Pressure, threats, or a tight deadline" },
  { id: "link", label: "Suspicious link or web address" },
  { id: "credentials", label: "Asks for a password, code, or payment" },
  { id: "generic", label: "Generic greeting (no real name)" },
  { id: "grammar", label: "Odd spelling, grammar, or tone" },
  { id: "attachment", label: "Unexpected attachment" },
] as const;

export type FlagId = (typeof FLAG_OPTIONS)[number]["id"];
const FLAG_IDS = FLAG_OPTIONS.map((f) => f.id) as string[];

export type PhishingEmail = {
  from: string;
  subject: string;
  body: string;
  links: { text: string; url: string }[];
  attachment?: string;
};

export type PhishingKey = {
  isPhishing: boolean;
  flags: FlagId[];
  explanation: string;
};

export type PhishingChallenge = { email: PhishingEmail; key: PhishingKey };

/** Check that whatever Gemini returned has the shape we expect. */
export function validateChallenge(raw: unknown): PhishingChallenge | null {
  try {
    const o = raw as any;
    const e = o.email;
    const k = o.key;
    if (typeof e?.from !== "string" || typeof e?.subject !== "string" || typeof e?.body !== "string") return null;
    if (typeof k?.isPhishing !== "boolean" || typeof k?.explanation !== "string") return null;
    const links = Array.isArray(e.links)
      ? e.links
          .filter((l: any) => typeof l?.text === "string" && typeof l?.url === "string")
          .slice(0, 3)
      : [];
    const flags = Array.isArray(k.flags) ? k.flags.filter((f: unknown) => FLAG_IDS.includes(String(f))) : [];
    return {
      email: {
        from: e.from.slice(0, 120),
        subject: e.subject.slice(0, 160),
        body: e.body.slice(0, 1500),
        links,
        attachment: typeof e.attachment === "string" ? e.attachment.slice(0, 80) : undefined,
      },
      key: {
        isPhishing: k.isPhishing,
        flags: k.isPhishing ? (flags as FlagId[]) : [],
        explanation: k.explanation.slice(0, 700),
      },
    };
  } catch {
    return null;
  }
}

/** Used when Gemini is unavailable (no key, quota, or network error). */
export const FALLBACK_CHALLENGES: PhishingChallenge[] = [
  {
    email: {
      from: "Northwind Bank Security <alerts@northwind-secure-login.example>",
      subject: "Your account will be closed in 24 hours",
      body: "Dear Customer,\n\nWe noticed unusual activity on your account. To avoid permanent closure, verify your identity immediately by confirming your password and the 6-digit code we just texted you.\n\nFailure to act within 24 hours will result in loss of access.\n\nNorthwind Security Team",
      links: [{ text: "Verify my account now", url: "http://northwind-secure-login.example/verify?id=88213" }],
    },
    key: {
      isPhishing: true,
      flags: ["sender", "urgency", "link", "credentials", "generic"],
      explanation:
        "The sender domain is not the bank's real domain, the message threatens closure in 24 hours, it greets you as 'Dear Customer', and it asks for your password and a one-time code. A real bank never asks for those by email.",
    },
  },
  {
    email: {
      from: "Pineapple Express Delivery <no-reply@pineapple-express.example>",
      subject: "Your package is on its way (Order #48-1177)",
      body: "Hi Maria,\n\nGood news! Your order #48-1177 shipped today and should arrive Thursday. You can follow it any time from the Orders page in the Pineapple Express app.\n\nNo action is needed.\n\nThanks for shopping with us,\nPineapple Express",
      links: [],
    },
    key: {
      isPhishing: false,
      flags: [],
      explanation:
        "This message uses your name, asks you to do nothing, has no suspicious link, and points you to the app you already use instead of a link. It is a normal shipping notice.",
    },
  },
  {
    email: {
      from: "HR Department <hr-payroll@acme-corp-benefits.example>",
      subject: "Updated payroll policy - action required",
      body: "Hello Employee,\n\nPlease open the attached file and sign in to review your new salary schedule. Employees who do not respond by end of day may see delays in their next payment.\n\nHuman Resources",
      links: [{ text: "Sign in to HR portal", url: "http://acme-corp-benefits.example/login" }],
      attachment: "Payroll_Update_2026.html",
    },
    key: {
      isPhishing: true,
      flags: ["sender", "urgency", "link", "generic", "attachment"],
      explanation:
        "A generic greeting, a deadline tied to your pay, a sign-in link on a look-alike domain, and an unexpected .html attachment. Verify through the company's real HR portal instead.",
    },
  },
  {
    email: {
      from: "Campus IT Helpdesk <helpdesk@riverside-college.example>",
      subject: "Scheduled maintenance this Saturday, 10 PM - 2 AM",
      body: "Hi students,\n\nThe campus Wi-Fi and student portal will be offline for maintenance on Saturday from 10 PM to 2 AM. You do not need to do anything. If you have questions, visit the IT desk in the library.\n\nCampus IT Helpdesk",
      links: [],
    },
    key: {
      isPhishing: false,
      flags: [],
      explanation:
        "It announces maintenance, asks for nothing, includes no links, and refers you to an in-person desk. Nothing here tries to rush you or collect information.",
    },
  },
];
