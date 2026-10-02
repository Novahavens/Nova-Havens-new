/**
 * Homepage / About FAQ content. Rendered on both pages and emitted as FAQPage
 * JSON-LD by src/lib/seo.ts — one source so the three never drift.
 */
export interface Faq {
  question: string;
  answer: string;
}

export interface FaqGroup {
  id: string;
  heading: string;
  items: Faq[];
}

export const HOME_FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'families',
    heading: 'For families needing housing',
    items: [
      {
        question: 'How quickly can my family move into a furnished home?',
        answer:
          'Once we have your location, household size, timing, and home requirements, our team starts matching you with available options. Many placements can be arranged within 24–48 hours, and urgent housing requests can be made 24/7 by calling (629) 401-0054.',
      },
      {
        question: 'Who requests the home for my family?',
        answer:
          'Your insurance adjuster, carrier, or relocation specialist will usually send the request with your household details. If you have an active claim but are still waiting for housing, call (629) 401-0054 and we can help you understand the next step.',
      },
      {
        question: 'What is included in a Nova Havens furnished home?',
        answer:
          'Homes are furnished for everyday living, with bedrooms, linens, a working kitchen, appliances, cookware, dishes, active utilities, internet, and comfortable living space. You should be able to arrive with personal belongings and start settling in right away.',
      },
      {
        question: 'Can I bring my pets with me?',
        answer:
          'Many homes welcome pets, but policies vary by property. Include each pet’s type, breed, number, and approximate weight in the request so we can match you with homes that can accommodate them.',
      },
      {
        question: 'Can we stay near school, work, or medical care?',
        answer:
          'Yes—tell us the school, workplace, hospital, or neighborhood that matters most before options are selected. We will take location and travel needs into account, although the final choices depend on availability and your carrier’s approval.',
      },
      {
        question: 'How do I explain accessibility or medical needs?',
        answer:
          'Share the details that affect daily living, such as step-free entry, a single-level layout, accessible parking, bathroom features, or room for medical equipment. Clear information at the start helps us avoid offering a home that cannot safely meet your needs.',
      },
      {
        question: 'How long can my family stay?',
        answer:
          'Your stay length depends on your policy, repair timeline, and carrier authorization. Your adjuster can confirm the approved period, while our team coordinates the home and helps request an extension when repairs take longer.',
      },
      {
        question: 'What happens if repairs take longer than planned?',
        answer:
          'Contact your adjuster and Nova Havens as soon as the timeline changes. When the home is available and the carrier approves the extension, staying in the same home may be possible and can help your family avoid another move.',
      },
      {
        question: 'What should I bring to a furnished home?',
        answer:
          'Bring identification and claim documents, medication, chargers, clothing, school or work essentials, and comfort items. Bedding, towels, furniture, kitchen equipment, and basic household furnishings are already provided.',
      },
      {
        question: 'Who helps me after move-in?',
        answer:
          'Nova Havens stays involved from move-in through move-out. Our team helps coordinate questions about the home, extensions, and next steps, so call (629) 401-0054 when you need support during your stay.',
      },
    ],
  },
];

export const HOME_FAQS: Faq[] = HOME_FAQ_GROUPS.flatMap((group) => group.items);
