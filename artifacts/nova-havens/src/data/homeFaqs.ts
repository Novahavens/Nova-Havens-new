export interface HomeFaq {
  question: string;
  answer: string;
}

export interface HomeFaqGroup {
  id: string;
  heading: string;
  items: HomeFaq[];
}

export const HOME_FAQ_GROUPS: HomeFaqGroup[] = [
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
        question: 'Will my insurance pay for the furnished home?',
        answer:
          'Nova Havens generally bills the insurance carrier or relocation partner directly, so families typically do not pay us out of pocket. Your carrier or adjuster decides what your policy covers, including any limits, approvals, or amounts you may owe.',
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
  {
    id: 'property-owners',
    heading: 'For property owners',
    items: [
      {
        question: 'What makes a property a good fit for displaced families?',
        answer:
          'A good fit is a safe, habitable, genuinely furnished home where a household can arrive and live comfortably for weeks or months. Working utilities, usable bedrooms, a functional kitchen, clear house rules, and accurate availability matter more than luxury finishes.',
      },
      {
        question: 'How do I submit my furnished property?',
        answer:
          'Use the property submission form to share the address or service area, property type, bedrooms and bathrooms, furnishings, availability, rate, pet policy, accessibility features, and your best contact details. For multiple properties, email properties@novahavens.com.',
      },
      {
        question: 'What happens after I submit my property?',
        answer:
          'Our partnerships team reviews the information and follows up if the home appears to fit the network. Submission is not acceptance: we verify the property and agree on terms before presenting it for a placement.',
      },
      {
        question: 'What types of furnished properties can I offer?',
        answer:
          'We consider furnished single-family homes, townhomes, condos, apartments, and duplexes in the communities we serve. The deciding factors are whether the home is ready for everyday living and whether it fits the household’s location, size, and needs.',
      },
      {
        question: 'How long do furnished placements usually last?',
        answer:
          'Most placements last weeks to months while a family’s home is repaired. Dates depend on the household’s situation and carrier approval, and a placement may be extended when repairs run over.',
      },
      {
        question: 'Do I have to accept every family or request?',
        answer:
          'No. We share requests that match your property’s location, size, features, pet rules, availability, and stated terms. You decide whether to accept a specific placement before anything is confirmed.',
      },
      {
        question: 'How are rates, deposits, and payment handled?',
        answer:
          'Your owner agreement sets out the rate, deposit, fees, payment timing, and other terms. Everything is agreed in writing with our partnerships team before a placement begins; billing arrangements may involve the carrier or relocation partner.',
      },
      {
        question: 'Can I set my own pet policy and house rules?',
        answer:
          'Yes. Tell us whether you accept pets, which types or sizes, and whether you review them case by case. Share other rules up front—such as parking, pool, smoking, or community requirements—so families receive an accurate match.',
      },
      {
        question: 'What must be ready before a family moves in?',
        answer:
          'The home should be clean, safe, code-compliant, furnished, functional, and ready for the agreed move-in date. Utilities, appliances, beds, seating, kitchen basics, and any disclosed accessibility features should work before the family arrives.',
      },
      {
        question: 'What happens when the placement ends?',
        answer:
          'The family moves out on the agreed date unless an extension is approved. A condition walkthrough compares the home with its move-in condition, with ordinary residential wear considered under the placement agreement.',
      },
      {
        question: 'Can a property manager submit on an owner’s behalf?',
        answer:
          'Yes. A property manager can submit a home when they have accurate details and can answer follow-up questions. Include the owner’s authorization and the best ongoing contact so the review stays straightforward.',
      },
    ],
  },
];

export const HOME_FAQS = HOME_FAQ_GROUPS.flatMap((group) => group.items);