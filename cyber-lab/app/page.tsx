import Link from "next/link";

const CASES = [
  { href: "/phishing", title: "Phishing desk", text: "Read an AI-written email, decide if it is a scam, then tag the red flags.", pts: "up to 100 per email" },
  { href: "/password", title: "Password lab", text: "Test practice passwords against a cracking estimate, then take a quick which-is-stronger quiz.", pts: "up to 100" },
  { href: "/ctf", title: "Prompt-injection CTF", text: "Three helpdesk bots guard a secret flag. Talk one into giving it up.", pts: "50 / 100 / 150" },
  { href: "/coach", title: "Security coach", text: "Ask the AI tutor anything about staying safe online. No points, no pressure.", pts: "free practice" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <h1>Spot the trick before it spots you.</h1>
          <p className="lede">
            Cyber Lab is a set of short, hands-on challenges. An AI writes fresh scams for you to catch, explains what you missed, and
            plays the target in a capture-the-flag game.
          </p>
          <div className="actions">
            <Link className="btn" href="/phishing">
              Open the phishing desk
            </Link>
            <Link className="btn ghost" href="/leaderboard">
              See the leaderboard
            </Link>
          </div>
        </div>
        <figure className="evidence" aria-label="Example phishing email with the suspicious parts highlighted">
          <div className="mail">
            <div className="mail-head">
              <div>
                From: Northwind Bank Security{" "}
                <mark>&lt;alerts@northwind-secure-login.example&gt;</mark>
              </div>
              <div>Subject: Your account will be closed</div>
            </div>
            <p>Dear Customer,</p>
            <p>
              We noticed unusual activity. <mark>Verify your password within 24 hours</mark> or lose access.
            </p>
            <p className="fake">Verify my account now</p>
          </div>
          <figcaption>The highlighted parts are the giveaways: a look-alike sender, a deadline, and a request for your password.</figcaption>
        </figure>
      </section>

      <section className="cases" aria-labelledby="cases-h">
        <h2 id="cases-h">Pick a challenge</h2>
        <ul>
          {CASES.map((c) => (
            <li key={c.href}>
              <Link href={c.href}>
                <span className="case-title">{c.title}</span>
                <span className="case-text">{c.text}</span>
                <span className="case-pts">{c.pts}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
