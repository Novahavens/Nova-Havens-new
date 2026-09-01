import { ArrowRight, Loader2, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Guidelines, Row } from '../parts';

export function ButtonDemo() {
  return (
    <div className="space-y-6 rounded-xl border bg-card p-6 text-card-foreground">
      <Row label="Nova Havens actions">
        <Button>Request housing</Button>
        <Button variant="outline">Submit property</Button>
        <Button variant="secondary">View coverage</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="link">Read the guide</Button>
      </Row>
      <Row label="Sizes and icons">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="Email">
          <Mail />
        </Button>
        <Button>
          Continue <ArrowRight />
        </Button>
      </Row>
      <Row label="States">
        <Button disabled>Disabled</Button>
        <Button disabled>
          <Loader2 className="animate-spin" /> Sending
        </Button>
        <Button variant="destructive">Report issue</Button>
      </Row>
      <Guidelines
        items={[
          { kind: 'do', text: 'Use a filled gold button for the primary action and a gold outline for the secondary path.' },
          { kind: 'do', text: 'Keep actions pill-like in page compositions while preserving the primitive’s compact API.' },
          { kind: 'dont', text: 'Use off-white text on the gold fill or make a large section of the page gold.' },
        ]}
      />
    </div>
  );
}