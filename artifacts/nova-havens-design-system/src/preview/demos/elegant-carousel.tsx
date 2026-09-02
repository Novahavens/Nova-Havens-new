import ElegantCarousel, {
  type ElegantSlide,
} from '../../components/ui/elegant-carousel';
import { Guidelines } from '../parts';

const DEMO_SLIDES: ElegantSlide[] = [
  {
    title: 'Living Spaces',
    subtitle: 'Move-in ready comfort',
    description:
      'Bright, open-plan living rooms with modern furnishings give families a calm place to settle in.',
    imageUrl:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Bright furnished living room with a modern sofa',
  },
  {
    title: 'Full Kitchens',
    subtitle: 'Everything included',
    description:
      'Well-equipped kitchens with full appliances and cookware are ready for the first meal on day one.',
    imageUrl:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Modern furnished kitchen with an island and appliances',
  },
  {
    title: 'Room for the Whole Family',
    subtitle: 'Rest, restored',
    description:
      'Comfortable bedrooms help families of any size stay together under one roof during recovery.',
    imageUrl:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Calm furnished bedroom with warm natural light',
  },
];

export function ElegantCarouselDemo() {
  return (
    <div className="space-y-6">
      <ElegantCarousel slides={DEMO_SLIDES} />
      <Guidelines
        items={[
          {
            kind: 'do',
            text: 'Use concise, meaningful slides with an image alt description that preserves the story without the image.',
          },
          {
            kind: 'do',
            text: 'Let autoplay pause on hover and provide previous, next, progress, and touch controls for direct navigation.',
          },
          {
            kind: 'dont',
            text: 'Use the carousel for content that must be compared side by side or that cannot be paused.',
          },
        ]}
      />
      <p className="text-sm text-muted-foreground">
        Autoplay advances every six seconds and pauses while the pointer is over
        the carousel. The surrounding page should honor
        <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">
          prefers-reduced-motion
        </code>
        for the transition experience.
      </p>
    </div>
  );
}