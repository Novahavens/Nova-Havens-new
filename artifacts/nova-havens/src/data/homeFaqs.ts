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
        question: 'What does Nova Havens do?',
        answer:
          'We coordinate fully furnished temporary homes for families who have been displaced by fire, water, or mold damage, and we manage the stay from move-in through to the end of it.',
      },
      {
        question: 'How do I get temporary housing?',
        answer:
          "In most cases your adjuster or relocation specialist submits the housing request for you, with your household's requirements. If you are not sure whether that has happened, call us on (629) 401-0054 and we will help you find out.",
      },
      {
        question: 'What is included in the home?',
        answer:
          'Furnished throughout, with beds made and linens provided, a fully equipped kitchen, smart TV and high-speed internet, and utilities active before you arrive. You should be able to move in and start living straight away.',
      },
      {
        question: 'Can my pets come with me?',
        answer:
          'Many of our properties are pet-friendly. Tell us the number of pets, their type, breed, and weight when the request is submitted, because those details determine which homes will accept them. We cannot guarantee a pet-friendly placement, but we accommodate pets wherever possible.',
      },
      {
        question: "Can I stay near my children's school?",
        answer:
          'Ask, and we will try. School continuity matters and it is much easier to account for at the start than to change later. Name the specific school or area when the request is submitted.',
      },
      {
        question: 'What if someone in my household has accessibility needs?',
        answer:
          'Tell us upfront. Single-level living, step-free access, and bathroom requirements all change which properties are suitable, and late disclosure is a common reason a placement has to be redone.',
      },
      {
        question: 'How long can I stay?',
        answer:
          "That depends on your policy and your carrier's authorisation, which your adjuster can tell you. On our side, we hold the home for the agreed period and handle extensions if repairs run longer than expected.",
      },
      {
        question: 'What if repairs take longer than expected?',
        answer:
          'This is common. Often the stay can simply be extended in the same home. Tell your adjuster as soon as you hear the timeline has changed — early notice makes it far more likely you can stay put rather than move a second time.',
      },
      {
        question: 'What should I bring?',
        answer:
          'Documents, medication, devices and chargers, about a week of clothing per person, and one comfort item per child. You do not need bedding, towels, kitchen equipment, or furniture — the home already has them.',
      },
      {
        question: 'Who do I contact during my stay?',
        answer:
          'The same team throughout. Intake, housing options, and managing your stay are all handled in-house, so you will not be passed between departments. Call (629) 401-0054 any time.',
      },
    ],
  },
  {
    id: 'property-owners',
    heading: 'For property owners',
    items: [
      {
        question: 'How do I list my property?',
        answer:
          'Submit your property details through our form: address, type, size, bedrooms and bathrooms, whether it is furnished, your pet policy, monthly rate, and availability. Our partnerships team reviews it and follows up to discuss adding it to the network.',
      },
      {
        question: 'What kinds of properties do you accept?',
        answer:
          'Furnished homes suitable for a household staying weeks to months — single-family homes, townhouses, condos, apartments, and duplexes. What matters most is that it is genuinely furnished and ready to live in.',
      },
      {
        question: 'Is submitting a property the same as being accepted?',
        answer:
          'No. We vet properties before adding them to the network, because placing a family somewhere unsuitable is worse than not placing them at all.',
      },
      {
        question: 'How long do placements usually last?',
        answer:
          'Weeks to months, depending on how long repairs take. Longer than a nightly rental, shorter and less predictable than an annual lease. Placements can extend if repairs overrun.',
      },
      {
        question: 'Do I have to accept every placement request?',
        answer:
          'No. You receive requests that match your property and your stated terms, and accepting any particular one is your decision.',
      },
      {
        question: 'How do I get paid?',
        answer:
          'Compensation is set out in your owner agreement, which is arranged directly with our partnerships team. Rates, deposits, and fees are agreed in writing before any placement.',
      },
      {
        question: 'Can I set my own pet policy?',
        answer:
          'Yes. You tell us whether your property accepts pets, does not, or considers them case by case, and we only send you matching requests.',
      },
      {
        question: 'What condition should the property be in?',
        answer:
          'Habitable, safe, code-compliant, and genuinely ready — furnished, functional, and with utilities able to be active on arrival. Households arrive after a disruptive event, so a home that simply works matters more than expensive finishes.',
      },
      {
        question: 'What happens at the end of a placement?',
        answer:
          'A condition walkthrough, with anything beyond ordinary wear assessed against the placement agreement. Expect ordinary residential wear from a household that lived there for weeks or months, not hotel-turnover condition.',
      },
      {
        question: 'Can I list more than one property?',
        answer:
          'Yes. For several properties at once, email properties@novahavens.com rather than submitting them one at a time.',
      },
    ],
  },
];

export const HOME_FAQS = HOME_FAQ_GROUPS.flatMap((group) => group.items);