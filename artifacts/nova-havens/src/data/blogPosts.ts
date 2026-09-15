/** Motif names available in scripts/generate-og-images.mjs for OG artwork. */
export type BlogPostMotif =
  | "ai"
  | "checklist"
  | "house"
  | "paw"
  | "key"
  | "magnifier"
  | "map"
  | "gears";

/**
 * Per-post closing CTA. Buttons must use these exact labels and point at the
 * shared JotForm URLs in src/lib/intakeForms.ts:
 * - "housing"  → "Submit a housing request"
 * - "property" → "Submit your property"
 * - "none"     → no CTA card (e.g. posts where a phone call is the action)
 */
export type BlogPostCta = "housing" | "property" | "none";

export interface BlogPost {
  id: number;
  slug: string;
  category: string;
  title: string;
  date: string;
  dateISO: string;
  excerpt: string;
  keywords: string[];
  /** Per-post OG image URL. Used in og:image meta and BlogPosting schema. */
  image?: string;
  /**
   * Optional OG image motif for scripts/generate-og-images.mjs.
   * Falls back to a category default when omitted.
   */
  motif?: BlogPostMotif;
  author?: {
    name: string;
    role: string;
  };
  cta: BlogPostCta;
  /**
   * Body conventions (enforced by BlogPostPage and the FAQ parser in
   * routeMeta.ts):
   * - The first block is a "> " blockquote rendered as the "Quick summary"
   *   callout — the summary text must appear there verbatim.
   * - H2 headings ("## ...") are phrased as questions; the first sentence
   *   beneath each one answers the question completely before elaborating.
   * - A "## Frequently Asked Questions" section of "**Question?**" blocks at
   *   the end generates the FAQPage JSON-LD automatically.
   *
   * Absolute content rules for every post:
   * - Never state, estimate or imply what any specific policy covers, what
   *   limits apply, how long coverage lasts, or whether an adjuster's
   *   decision was correct — direct the reader to their carrier or adjuster.
   * - Never state a total property count. "47 states" is verified and may be
   *   used; a property count must not appear.
   */
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    slug: "details-that-speed-up-housing-placement",
    motif: "checklist",
    category: "For Insurance Professionals",
    title: "Seven Details That Speed Up a Housing Placement",
    date: "August 13, 2026",
    dateISO: "2026-08-13",
    keywords: ["housing placement speed", "temporary housing request", "insurance housing intake", "ALE housing requirements", "adjuster housing request", "housing placement delay"],
    excerpt:
      "The single biggest cause of delay in a housing placement isn't availability — it's incomplete requirements. Seven fields do most of the work, and a request with all seven can be matched immediately.",
    cta: "housing",
    content: `> The single biggest cause of delay in a housing placement isn't availability — it's incomplete requirements. Seven fields do most of the work: preferred city and state, bedrooms and bathrooms needed, occupancy counts, pet details, accessibility requirements, desired move-in date, and estimated duration. A request with all seven can be matched immediately. A request missing two or three usually means a phone call before anything moves.

## What information matters most?

Seven fields determine whether a housing request can be matched on the first pass: preferred city and state, bedrooms and bathrooms needed, occupancy counts, pet details, accessibility requirements, desired move-in date, and estimated duration. Everything else is refinement. Here is why each one changes the match.

**Preferred city and state.** The preferred location often differs from the damaged address. Families anchor on school catchments, workplaces, or relatives nearby — not necessarily on the street they were displaced from. A request that supplies only the loss address can send the search to the wrong geography entirely.

**Bedrooms and bathrooms needed.** Occupancy counts alone are insufficient. Five people could be a couple with three children or five adults; those are different properties. Headcount combined with bedroom and bathroom needs is the actionable combination.

**Occupancy counts.** The number of people — adults and children separately where possible — drives bedding configuration, and it is checked against the property's capacity before anything is proposed.

**Pet details.** Number, type, breed and weight. Breed and weight are what determine which properties will accept an animal, so "two pets" is not actionable where "two cats, both under 10 lb" is.

**Accessibility requirements.** Step-free entry, a ground-floor bedroom, a walk-in shower. These are binary filters — a property either works or it does not — and they eliminate most options at a stroke, which is exactly why they need to be known before the search starts.

**Desired move-in date.** This sets the tempo of the search and tells property owners how quickly the home needs to turn around.

**Estimated duration.** Owners make availability decisions on term length. A one-month request and a nine-month request match different properties, even on the same street. An owner holding a property open for a longer placement will often decline a short one, and vice versa — so an honest estimate at intake produces a real match instead of a provisional one.

## What slows things down most?

Missing pet details and missing accessibility requirements slow placements the most, in that order. Both tend to surface late — after a property has been identified — and both can invalidate a match that otherwise worked. A home selected on Monday goes back to zero on Wednesday when the 70-pound dog or the step-free entry requirement appears for the first time.

The pattern behind both is the same: they are the details people assume will be flexible. They rarely are. Pet acceptance is a property owner's decision, and accessibility is a physical fact about the building. Neither can be negotiated after the fact, so both belong in the first submission rather than the follow-up call.

## What if you don't have everything?

Submit anyway. A partial request in the system beats a complete request sitting in a draft email. The team follows up on gaps directly, and the request is logged and moving in the meantime.

For urgent situations — a family with nowhere to sleep tonight — call (629) 401-0054 rather than submitting a form.

## Frequently Asked Questions

**Who can submit a housing request?**
Anyone involved in the placement — the adjuster, a carrier representative, or the family itself. All requests land in the same intake queue and receive the same handling.

**Should a request wait until coverage is confirmed?**
No. The coverage determination is a separate conversation between the carrier and the policyholder, and questions about what a policy authorizes belong with the adjuster. Submitting the request early lets requirements-gathering happen in parallel rather than after.

**What happens after a request is submitted?**
The request is logged, a coordinator reviews the requirements, and any gaps are followed up directly. Matched options are then presented for review before anything is booked.

**How are changes handled after submission?**
Contact the coordination team with the update — a changed move-in date, a new pet, a longer expected duration. Small changes early are cheap; the same changes after a property is selected often restart the match.`,
  },
  {
    id: 2,
    slug: "hotel-or-furnished-home-adjusters-guide",
    motif: "house",
    category: "For Insurance Professionals",
    title: "Hotel or Furnished Home? An Adjuster's Guide to ALE Housing Options",
    date: "August 13, 2026",
    dateISO: "2026-08-13",
    keywords: ["ALE housing options", "hotel vs furnished home", "adjuster housing guide", "temporary housing comparison", "insurance displacement housing", "extended stay vs furnished rental"],
    excerpt:
      "Hotels are faster to arrange and suit short displacements. Furnished homes generally cost less per day over longer periods, accommodate families and pets far better, and reduce escalation calls. The practical dividing line is expected duration.",
    cta: "housing",
    content: `> Hotels are faster to arrange and suit short displacements. Furnished homes generally cost less per day over longer periods, accommodate families and pets far better, and reduce escalation calls. The practical dividing line is expected duration: for anything beyond about two weeks, a furnished home is usually the better answer for both the file and the household.

Nova Havens coordinates housing; it does not make coverage determinations. What follows covers the practical trade-offs between housing types — not what any policy pays for.

## When is a hotel the right call?

A hotel is the right call for short or uncertain displacements. If the household may be home within days, or the loss is still being assessed and the timeline is genuinely unknown, a hotel's flexibility is the point: check in tonight, extend or check out as the picture clears.

Hotels also suit single occupants and couples without pets, where space is not the constraint. One person in one room for four nights is a clean arrangement that needs no further engineering.

## When does a furnished home make more sense?

Once the expected duration passes roughly two weeks, a furnished home makes more sense, and several things shift at once.

**Families.** Multiple hotel rooms for a family of five is expensive and miserable — adjoining rooms, hallway negotiations, no table to sit at together. A three-bedroom home is one arrangement with one front door.

**Pets.** Pet-friendly hotels are limited, and many restrict by size or breed. A household with a large dog can find itself effectively locked out of the hotel market in some areas, while furnished homes with yards or pet acceptance are a normal part of the inventory.

**Cooking.** Restaurant meals for a household over weeks become their own expense line. A kitchen changes the daily arithmetic and the daily routine — breakfast at a table instead of a lobby queue.

**Normalcy.** Children in their own rooms, with a kitchen and a door that closes, generate fewer distressed calls. That shows up in the file as fewer escalations and fewer weekend phone calls. A household that can cook, do homework at a table and keep a routine is a household that does not need to ring its adjuster to ask when it can go home.

## What about the administrative difference?

A hotel is a nightly transaction that needs repeated extension; a furnished placement is arranged once for an agreed term. With a hotel, each extension is a new touchpoint — and a new chance for a sold-out weekend or a rate change. With a furnished placement, there is one point of contact through to the end of the claim, and extensions are handled in one conversation rather than night by night.

## How do you decide quickly?

Two questions decide it. Is this longer than two weeks? Are there children or pets? If either answer is yes, start with a furnished home. If both are no, a hotel is usually the efficient answer.

One closing note: coverage, limits and authorisation remain matters for the carrier and the policy. This guide covers which housing type works better in practice — the coverage conversation stays with the adjuster and the policyholder.

## Frequently Asked Questions

**Can a family start in a hotel and move to a furnished home?**
Yes, and it is a common pattern. A hotel covers the first nights while a furnished placement is arranged, then the household moves once. The request should note the hotel stay so the timeline is clear.

**Is a furnished home more expensive than a hotel?**
Over longer stays, furnished homes generally cost less per day than comparable hotel arrangements. What any specific policy authorizes or reimburses is determined by the carrier, not by the housing coordinator.

**Who handles extensions on a furnished placement?**
The coordination team. When a repair timeline moves, the placement is extended in a single conversation with the same point of contact rather than renegotiated night by night at a front desk.

**What information does a placement request need?**
The essentials are the household's preferred location, size, pet details, accessibility requirements, move-in date and expected duration. The more complete the request at intake, the faster a suitable home can be matched.`,
  },
  {
    id: 3,
    slug: "hotel-or-furnished-home-what-to-expect",
    motif: "key",
    category: "For Displaced Families",
    title: "Hotel or Furnished Home? What to Expect From Each",
    date: "August 13, 2026",
    dateISO: "2026-08-13",
    keywords: ["temporary housing after fire", "hotel vs furnished home", "displaced family housing", "what to expect temporary housing", "insurance housing for families", "furnished home after house fire"],
    excerpt:
      "If you'll be out of your home for more than a couple of weeks, a furnished home usually works better than a hotel — especially with children or pets. This explains what each option is actually like to live in.",
    cta: "none",
    content: `> If you'll be out of your home for more than a couple of weeks, a furnished home usually works better than a hotel — especially with children or pets. It has bedrooms, a kitchen, and space. Your adjuster decides what your policy covers; this explains what each option is actually like to live in.

Being told you can't go home is disorienting. The housing question usually arrives before you've had time to think. This page is not advice about your policy — your adjuster is the right person for that. It is a plain description of what each option is like, so the choice in front of you is a little clearer.

## What is a hotel stay like?

A hotel is immediate, and that matters if you need somewhere tonight. You can often be checked in within hours.

The trade-off is the space. A hotel is one or two rooms. There is no kitchen, so meals come from restaurants or takeaway. For a few nights this is manageable. Over weeks it gets hard, particularly for a family. Children need room to play and somewhere quiet to sleep. Meals out three times a day wear thin, for patience and for budget. Laundry becomes a chore with no machine. And many hotels limit pets by size or breed, which can rule them out entirely if you have animals.

None of this makes a hotel the wrong choice. For a short stay, it is often the simplest one. It is worth knowing what the weeks feel like before they arrive.

## What is a furnished home like?

A furnished home is a whole house or apartment that is already set up. The furniture is there. The beds are made. The kitchen has what you need to cook. The utilities are on before you arrive. You unpack once, and then you stay.

It feels closer to normal life. Children get their own rooms. You can cook dinner and sit at a table. There is a door between you and the world.

Many properties accept pets. The details matter when the request is submitted — how many pets, what type, the breed and weight — because that is what determines which homes will take them. Share those details early and the search goes straight to the homes that fit.

## Can you ask for specific things?

Yes, and it is worth doing. You can ask for a number of bedrooms. You can ask for a single-level home if someone in your household has mobility needs. You can ask for a particular area if keeping your children in the same school matters.

Tell whoever is submitting the request — your adjuster, or the Nova Havens team directly. These things are much easier to account for upfront than to change after a home has been found, and no request is too small to mention.

## Who decides which one you get?

Your coverage and your carrier's authorisation determine what is available to you. That conversation is with your adjuster. They can tell you what your policy provides.

Once housing is authorised, Nova Havens handles finding and arranging the home itself. You do not have to search listings or call landlords. The options are brought to you.

If you need to speak to someone, call (629) 401-0054. Someone is available.

## Frequently Asked Questions

**How long does it take to move into a furnished home?**
Most families move in within days of the request being submitted. Your coordinator will tell you what the timeline looks like for your situation.

**What do we need to bring with us?**
Bring clothes, medications, documents, and the personal things your household needs day to day. The furniture, kitchen equipment and linens are already in the home.

**What if the home offered doesn't work for us?**
Say so. Tell the team what doesn't fit — the area, the layout, the stairs — and the search continues. It is easier to find the right home than to spend weeks in the wrong one.

**Can our pets come with us?**
In many homes, yes. A large share of the properties Nova Havens works with accept pets. What matters is sharing the details at the start — how many, what type, breed and weight — so the search only includes homes that will welcome them.`,
  },
  {
    id: 4,
    slug: "how-to-list-your-furnished-property",
    motif: "key",
    category: "For Property Owners",
    title: "How to List Your Furnished Property for Insurance Housing",
    date: "August 20, 2026",
    dateISO: "2026-08-20",
    keywords: [
      "list furnished property for insurance housing",
      "property owner insurance housing",
      "furnished rental host application",
      "temporary housing property submission",
      "host displaced families",
      "furnished property network",
    ],
    excerpt:
      "Property owners can submit a furnished home for consideration in the Nova Havens network. A complete submission describes the home's layout, furnishings, availability, location, and pet or accessibility details so the team can determine whether it fits upcoming placement needs.",
    cta: "property",
    content: `> Property owners can submit a furnished home for consideration in the Nova Havens network. A complete submission describes the home's layout, furnishings, availability, location, and pet or accessibility details so the team can determine whether it fits upcoming placement needs. The first step is simply sharing accurate property information and a reliable way to reach you.

## What should you prepare before submitting a property?

Prepare the facts a coordinator needs to understand whether the home can suit a displaced household: its address or service area, bedroom and bathroom count, furnished spaces, current availability, pet policy, accessibility features, and the best contact details for you or your property manager.

Photographs and a concise description of the home are useful when available. Be clear about any practical limits as well: stairs, parking constraints, HOA requirements, minimum stays, maintenance work, or dates when the property cannot be occupied. Accurate details at the start prevent a coordinator from presenting the home for a placement it cannot support.

## What makes a property ready for a furnished placement?

A property is ready for a furnished placement when a household can arrive and use it as a home, not as an empty rental. Bedrooms, seating, a functioning kitchen, utilities, and the ordinary essentials for day-to-day living should all be in place before the property is submitted as available.

The layout matters as much as the furnishing list. A two-bedroom apartment may be a good fit for one household and not another; a ground-floor bedroom or step-free entry may be essential for a particular placement. Describe what is actually there rather than trying to predict which family it will suit.

## How does Nova Havens review a submitted property?

Nova Havens reviews the information you submit and follows up when more detail is needed. The team considers whether the property's location, setup, availability, and household fit align with current or upcoming housing needs.

Submitting a property begins a conversation; it does not promise a placement or guarantee a particular timeline. A coordinator can explain the next steps for your property and request anything needed to evaluate it accurately.

## Why do availability and house rules matter?

Availability and house rules matter because each placement has a specific move-in date, household size, expected duration, and practical requirements. A home that is an excellent fit next month may not work for a family that needs it this week.

Share the dates the property can be occupied, whether the dates are flexible, and any rules that affect a stay. If pets are accepted, list the types, sizes, or number of animals that work. If the property has stairs, a pool, gated access, parking limits, or community requirements, include those details too.

## Frequently Asked Questions

**Can I submit a property if it is not available today?**
Yes. Include the earliest available date and any known future blackout dates. That information helps the team consider the property for placements with a matching timeline.

**Do I need to know which family will stay before I submit?**
No. Submit the property details first. When a household's requirements align with the home's location, layout, availability, and rules, a coordinator can discuss the potential placement with you.

**What information should I include about pets?**
Include whether pets are accepted and any limits by number, type, breed, or weight. If there are pet fees, deposits, or other requirements, identify them so they can be reviewed before the property is considered for a pet-owning household.

**Can a property manager submit on an owner's behalf?**
Yes. A property manager can submit the home when they can provide accurate property details and serve as the point of contact for follow-up questions.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export const BLOG_FILTERS = [
  "All",
  "For Insurance Professionals",
  "For Displaced Families",
  "Market Guides",
] as const;
