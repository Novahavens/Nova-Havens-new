/**
 * teamMembers.ts — FALLBACK roster for the Meet the Team page.
 *
 * The live roster is synced daily from the Google Form responses sheet into
 * Object Storage by scripts/sync-team.js (team/team.json), served at
 * /api/team/team.json, and TeamPage.tsx fetches it at runtime. THIS FILE is
 * only the offline fallback: it renders when the fetch fails or returns
 * nothing, so the page never renders empty. It is also consumed by
 * routeMeta.ts (Person JSON-LD) and routeContent.ts (crawler HTML) for
 * build-time structured data and prerendered copy.
 *
 * Rules for this data (per client instruction):
 * - Only members who have submitted the profile form appear here. Every
 *   listed member carries a `profile`; every card is interactive and opens
 *   a profile modal.
 * - Profile answers are the members' own words — use them exactly as written.
 * - No phone numbers or emails for individuals; contact routing stays on the
 *   Contact page and intake forms.
 *
 * Must stay free of browser APIs and React — imported by Node build scripts.
 */

export interface TeamMemberProfile {
  /** "How I help our clients" */
  help: string;
  /** "My favourite part of working here" */
  favouritePart: string;
  /** "Favourite foods" */
  foods: string;
  /** "Guaranteed to make me laugh" */
  laugh: string;
  /** "In my spare time" */
  spareTime: string;
}

export interface TeamMember {
  name: string;
  /** Omit entirely when no role is confirmed — the card shows no role line. */
  role?: string;
  initials: string;
  profile: TeamMemberProfile;
  /** Synced profile photo URL (served from Object Storage). Null/absent = initials avatar. */
  photoUrl?: string | null;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Paulina Avellaneda",
    role: "Senior Property Coordinator",
    initials: "PA",
    profile: {
      help: "I help make a stressful situation a little easier by finding comfortable temporary housing that fits our clients' needs, budget, and timeline. I'm here to coordinate the details, communicate with everyone involved, and make sure our clients feel supported throughout the process.",
      favouritePart: "The people I get to work with and knowing that what I do actually helps families during a difficult time. I also enjoy the challenge of finding the right solution, especially when a claim seems impossible at first!",
      foods: "Seafood, pasta, and tacos. I'm always happy to try a new restaurant, especially if there's dessert involved.",
      laugh: "A good sarcastic comment, funny conversations with friends, and those random moments that happen when you least expect them.",
      spareTime: "Spending time with family and friends, discovering new places to eat, going to the beach, and traveling whenever I get the chance. I also enjoy those weekends where the only plan is good food and relaxing.",
    },
  },
  {
    name: "Alishia Isaac",
    role: "Housing Coordination",
    initials: "AI",
    profile: {
      help: "I am the dedicated partner to our Housing Specialists, managing the relocation journey from the initial client inquiry through to the policyholder's move-in day. I serve as a seamless extension of the team, handling the heavy lifting to ensure our clients are genuinely supported. I take pride in making the relocation process clear, effortless, and stress-free for both our insurance partners and the families we serve.",
      favouritePart: "Hands down, it's our shared mission and collaborative spirit. We have an incredible team where everyone brings their own unique expertise to keep things moving forward. But the best feeling of all is bringing a sense of relief and normalcy back to families during a vulnerable time.",
      foods: "Beef short ribs paired with creamy mashed potatoes and mac & cheese, or asada street tacos when I want something quick. As for dessert, any cupcake flavour topped with buttercream frosting is my absolute weakness.",
      laugh: "Witty memes on social media. They honestly get me every time.",
      spareTime: "I love exploring low-key lounges with live music and checking out new restaurants around town. I'm also big on trying new hobbies — I love picking up new skills, I just haven't found my all-time favourite yet.",
    },
  },
  {
    name: "Sydney Maraletos",
    role: "Leasing & Move-In Coordination",
    initials: "SM",
    profile: {
      help: "I assist in coordinating the leasing and move-in process, keeping details organized and communication clear to help make each family's transition into temporary housing as smooth and stress-free as possible.",
      favouritePart: "Helping families through some of life's most difficult moments alongside an incredible team that genuinely cares about the people we serve and the work we do.",
      foods: "Butter chicken (or really any Indian food), pizza with ranch, and boxed white cheddar mac and cheese.",
      laugh: "Pretty much anything my puppy, Finn, does. He gets himself in the most ridiculous situations every day.",
      spareTime: "Anything outdoors. My husband and I love to go paddle boarding, hiking, swimming, fishing — you name it. I also like to paint, crochet, bake, and try different arts and crafts on the days we spend at home.",
    },
  },
  {
    name: "Chané Burger",
    role: "Client Coordination",
    initials: "CB",
    profile: {
      help: "I support Nova Havens clients by coordinating smooth move-ins and move-outs for temporary housing. I help families settle into safe, welcoming accommodation, guide them through the process, answer their questions, and ensure they have the information they need during their stay. I also work to make transitions as stress-free as possible, treating every client with compassion, respect, and professionalism.",
      favouritePart: "Being able to help families in need during an important time in their lives. I also love the camaraderie within the team — everyone is supportive, works together, and is always willing to help one another. It's rewarding to be part of a team that shares the same commitment to making a positive difference.",
      foods: "Soup and sushi.",
      laugh: "A good dry joke.",
      spareTime: "In my spare time, you'll usually find me reading a good book or camping. I love being outdoors and enjoying nature whenever I get the chance.",
    },
  },
  {
    name: "Brenda Mlunjwa",
    role: "Client Support",
    initials: "BM",
    profile: {
      help: "I support clients by managing move-in communication, coordinating maintenance requests, and assisting with the move-out process to ensure a smooth experience.",
      favouritePart: "Building relationships with clients and creating a positive experience through clear communication and reliable support.",
      foods: "Shepherd's pie.",
      laugh: "Funny husky videos, and any movie with Kevin Hart.",
      spareTime: "Exploring — I recently started traveling.",
    },
  },
];
