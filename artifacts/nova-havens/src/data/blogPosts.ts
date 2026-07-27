export interface BlogPost {
  id: number;
  slug: string;
  category: string;
  title: string;
  date: string;
  dateISO: string;
  excerpt: string;
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    slug: "how-ai-is-streamlining-temporary-housing-placements-for-adjusters",
    category: "Insurance Professionals",
    title: "How AI Is Streamlining Temporary Housing Placements for Adjusters",
    date: "June 12, 2025",
    dateISO: "2025-06-12",
    excerpt:
      "Discover how automated claim processing reduces placement times from days to hours, keeping families happier and reducing carrier costs.",
    content: `When a major loss claim comes in, speed matters. Families displaced by fire, water, or mold damage need somewhere safe to stay — and they need it fast. Historically, coordinating temporary housing meant a flood of phone calls, manual property searches, and days of back-and-forth before a family could move in.

Nova Havens has changed that equation. By incorporating automation and agentic AI into our claim intake and matching workflow, we've cut average placement times from several days to under 48 hours in most markets.

**How it works**

When a claim comes through — whether via phone, email, or carrier portal — our system immediately begins cross-referencing the family's needs (size, location, pets, accessibility requirements) against our verified property inventory. Automated scoring ranks available properties by proximity, suitability, and availability. A Nova Havens coordinator reviews the top matches within minutes and reaches out to the family.

**What this means for adjusters**

For independent adjusters and carrier teams, fewer touchpoints means fewer delays. You submit the claim details once. We handle the rest and keep you updated with status notifications throughout the placement process.

**The human element**

Automation handles the logistics. Our team handles the relationship. Families going through a displacement event need empathy and clear communication, not just efficiency — and that's where our coordinators step in.`,
  },
  {
    id: 2,
    slug: "what-to-look-for-in-a-housing-coordinator-for-large-loss-claims",
    category: "Insurance Professionals",
    title: "What to Look for in a Housing Coordinator for Large-Loss Claims",
    date: "May 28, 2025",
    dateISO: "2025-05-28",
    excerpt:
      "When the worst happens, you need a coordinator with the network and experience to handle complex placement requirements seamlessly.",
    content: `Large-loss claims are different. The families involved often have more complex needs — larger households, pets, medical equipment, proximity requirements — and the stakes are higher for everyone involved.

Choosing the right housing coordinator for these situations isn't just a logistics decision. It's a service decision that directly affects the family's experience and the carrier's reputation.

**What to evaluate**

*Network depth and verification* — A coordinator is only as good as their inventory. Ask about how properties are verified: inspection processes, furnishing standards, background checks on property owners, and how quickly they can activate new properties in a given market.

*Single point of contact* — When multiple parties are involved (carrier, adjuster, relocation specialist, family), coordination can break down fast. Look for a provider that assigns one dedicated coordinator to manage the entire lifecycle of the placement.

*Transparency and reporting* — Can you get real-time status updates? Does the coordinator proactively notify you of issues, or do you have to chase them? Good coordinators surface problems early, before they become complaints.

*Experience with edge cases* — ADA accessibility requirements, multi-pet households, temporary placements that extend unexpectedly — the best coordinators have protocols for these situations and don't treat them as exceptions.

Nova Havens was designed from the ground up with the insurance workflow in mind. Our coordinators are trained on carrier requirements and work seamlessly within your existing processes.`,
  },
  {
    id: 3,
    slug: "what-to-expect-when-your-insurer-places-you-in-temporary-housing",
    category: "Displaced Families",
    title: "What to Expect When Your Insurer Places You in Temporary Housing",
    date: "May 14, 2025",
    dateISO: "2025-05-14",
    excerpt:
      "Losing your home is stressful enough. Here is a step-by-step guide on what the transition to temporary furnished housing looks like.",
    content: `Dealing with a home loss — whether from fire, water damage, or mold — is one of the most disorienting experiences a family can go through. If your insurance carrier is coordinating temporary housing for you, here's what you can generally expect from the process.

**Step 1: The initial call**

Once your claim is active and your carrier has determined that Additional Living Expenses (ALE) coverage applies, they'll connect you with a housing coordinator like Nova Havens. Expect a phone call or text within a few hours. We'll ask about your household: how many people, any pets, any accessibility needs, and where you need to be (school districts, proximity to work, etc.).

**Step 2: You'll receive housing options**

Within 24-48 hours in most markets, we'll send you two or three options that match your needs. These are fully furnished homes — beds, linens, kitchen supplies, Wi-Fi, and TV are all included. You review them, ask questions, and we'll arrange a showing if you'd like.

**Step 3: Move-in coordination**

Once you choose a property, we coordinate everything with your carrier and the property owner. We give you a move-in date, key instructions, and a direct line to your Nova Havens coordinator for any questions.

**During your stay**

Your coordinator remains your point of contact throughout. If something breaks, if you need to extend your stay, or if any issue comes up with the property, you call us — not the property owner, not your carrier. We handle it.

**A note on costs**

If your ALE coverage is active, you typically won't pay out of pocket for the housing. Nova Havens bills your carrier or adjuster directly.`,
  },
  {
    id: 4,
    slug: "bringing-pets-to-temporary-housing-what-you-need-to-know",
    category: "Displaced Families",
    title: "Bringing Pets to Temporary Housing: What You Need to Know",
    date: "April 30, 2025",
    dateISO: "2025-04-30",
    excerpt:
      "Don't leave your furry family members behind. Learn how to navigate pet policies and find pet-friendly temporary homes during a claim.",
    content: `Pets are family. When you're displaced from your home, leaving them behind isn't an option — but finding temporary housing that accepts animals can feel like an additional burden layered on top of an already stressful situation.

Nova Havens maintains a dedicated segment of pet-friendly properties in our network, and when you contact us, we flag your pet needs from the very first conversation.

**What "pet-friendly" means in our network**

All of our pet-friendly properties have been verified to allow animals. We track:
- Whether pets are allowed at all
- Size and breed restrictions (some properties have weight limits)
- The number of pets permitted
- Any pet deposit requirements (covered by your ALE policy in most cases)

**How to make the process smooth**

Be upfront about your pets when you first speak with your coordinator. The more detail you provide — species, breed, weight, number of animals — the faster we can narrow the search to properties that will genuinely work for you.

If you have a larger dog or an unusual pet (a reptile, for example), let us know early. We can usually find a solution, but it may take a day or two longer to source the right property.

**What to bring**

Pack your pet's essentials just as you would for a hotel stay: food, medications, crate or bed, vaccination records (some properties request these), and leashes. Treat the home with the same care you'd want someone to show yours.

We want every member of your family — including the four-legged ones — to feel at home during a difficult time.`,
  },
  {
    id: 5,
    slug: "how-to-list-your-furnished-property-with-nova-havens",
    category: "Property Owners",
    title: "How to List Your Furnished Property with Nova Havens",
    date: "April 15, 2025",
    dateISO: "2025-04-15",
    excerpt:
      "Join our network of premium furnished homes and start hosting families who need a safe place to land during home repairs.",
    content: `If you own a furnished property — a second home, an investment property, or a unit you manage — partnering with Nova Havens gives you access to a steady, reliable stream of placements coordinated through insurance carriers.

Unlike short-term rental platforms, Nova Havens placements typically run 30-90 days, and our clients (insurance carriers) pay promptly and professionally.

**What types of properties qualify?**

We're looking for fully furnished homes and apartments with at least one bedroom. Properties should include:
- Beds with linens
- Kitchen with basic cookware and dishes
- Wi-Fi
- Washer and dryer (or in-building laundry)
- TV in the living room

The property doesn't need to be luxury — but it does need to be clean, safe, and genuinely comfortable. Families coming through our program have just experienced a loss. They deserve a home, not just a place to sleep.

**The onboarding process**

1. **Submit your property** through our contact form or by calling us at (629) 401-0054
2. **We'll schedule an inspection** — a Nova Havens coordinator will visit (or conduct a virtual walkthrough) to verify the property meets our standards
3. **We add you to the network** — your property goes into our inventory, and we match families to it based on location, size, and availability

**What to expect as a host**

Nova Havens handles all coordination with the family and carrier. You deal with us, not with the displaced family directly (unless you prefer otherwise). We also handle any disputes or issues that arise during the stay.

Reach out to learn more about compensation structures and availability expectations for your market.`,
  },
  {
    id: 6,
    slug: "what-insurance-housing-coordinators-look-for-in-a-property",
    category: "Property Owners",
    title: "What Insurance Housing Coordinators Look for in a Property",
    date: "March 22, 2025",
    dateISO: "2025-03-22",
    excerpt:
      "From fast Wi-Fi to comfortable bedding, learn the specific amenities that make a property perfect for displaced families.",
    content: `Not all furnished properties are created equal — at least not from the perspective of a family that just experienced a home loss. Here's what Nova Havens looks for when evaluating properties for our network, and what you can do to make your property more competitive.

**The essentials**

These aren't negotiable:
- **Working Wi-Fi** — families working from home, students in school, and parents coordinating with contractors all depend on reliable internet
- **Comfortable beds with quality linens** — after the stress of a displacement, sleep matters
- **Stocked kitchen** — enough cookware, dishes, and utensils to prepare basic meals
- **Washer and dryer** — or access to in-building laundry; doing laundry at a laundromat is an unnecessary burden

**What sets a property apart**

Families notice the details. Properties that receive the best feedback from our clients tend to have:
- A real coffee maker (not just instant)
- Blackout curtains in the bedrooms
- A dining table large enough for the household
- Basic pantry staples stocked on arrival (oil, salt, coffee)
- Clear and simple instructions for appliances, Wi-Fi, and entry

**Pet-friendly is a differentiator**

A significant portion of the families we place have pets. If your property allows animals, we'll flag it in our system and prioritize it for those placements. Pet-friendly properties are in high demand and typically have shorter vacancy gaps.

**Reliability matters more than luxury**

Our carrier clients need to know that when they approve a property, it's actually going to be available and in the condition we described. Reliable, consistently well-maintained properties are more valuable to us than inconsistently available luxury ones.`,
  },
  {
    id: 7,
    slug: "nova-havens-expands-to-48-states",
    category: "Company News",
    title: "Nova Havens Expands to 48 States",
    date: "March 8, 2025",
    dateISO: "2025-03-08",
    excerpt:
      "We are proud to announce our nationwide expansion, bringing our compassionate housing coordination to families across the contiguous US.",
    content: `Nova Havens began with a simple premise: families displaced by home damage deserve better than the fragmented, impersonal process that had become the industry standard. Starting in the Southeast, we built a network of verified furnished properties and a coordination model that kept families — not paperwork — at the center of every placement.

Today, we're proud to announce that Nova Havens now operates in 48 states across the contiguous United States.

**What this means for carriers and adjusters**

No matter where a claim originates, Nova Havens can support the placement. Our national network means you don't need different vendors for different regions — one relationship, one point of contact, regardless of state.

**What this means for families**

If you're displaced in a small market or a rural area, you're no longer an afterthought. We've invested in building inventory beyond major metros, recognizing that families in smaller communities face the same housing need and deserve the same quality of service.

**What this means for property owners**

If you own a furnished property anywhere in the contiguous US, we want to hear from you. Contact us at (629) 401-0054 or info@novahavens.com to learn about joining our network.

**What's next**

We're focused on deepening our inventory in markets where demand outpaces supply, continuing to invest in our automation and AI infrastructure, and building stronger integrations with carrier and adjuster systems. More announcements coming later this year.`,
  },
  {
    id: 8,
    slug: "introducing-automated-claim-processing-at-nova-havens",
    category: "Company News",
    title: "Introducing Automated Claim Processing at Nova Havens",
    date: "February 19, 2025",
    dateISO: "2025-02-19",
    excerpt:
      "Our new agentic AI technology allows us to process incoming claims and generate housing options faster than ever before.",
    content: `Since Nova Havens was founded, our coordinators have worked tirelessly to turn around housing options as quickly as possible for displaced families. That process — matching household needs to available inventory, verifying availability, generating options — has historically been manual. We've been building toward a better way.

Today, we're introducing automated claim processing powered by agentic AI at Nova Havens.

**What's changed**

When a claim comes in, our system now automatically:
- Parses the household's needs from the intake information
- Cross-references our verified property inventory in real time
- Scores and ranks properties by suitability, proximity, and availability
- Generates a shortlist of options for coordinator review

Our coordinators review and approve the shortlist before anything goes to the family — the human judgment isn't removed, it's amplified. We're handling the data work so our team can focus on the conversation.

**Transparency about automated processing**

We believe in being clear about when and how automation plays a role in our process. Some elements of property matching and claim triage are now handled by automated systems. If you have questions about how this affects a specific placement, please reach out to your coordinator directly.

**The outcome**

In our pilot markets, average time-to-options dropped by over 60%. Families are receiving housing choices the same day in most cases. For carriers and adjusters, this means faster claims resolution and fewer callbacks.

We're excited about what this means for the families we serve — and we're just getting started.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export const BLOG_FILTERS = [
  "All",
  "Insurance Professionals",
  "Displaced Families",
  "Property Owners",
  "Company News",
] as const;
