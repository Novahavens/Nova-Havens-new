import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Guidelines } from '../parts';

export function CardDemo() {
  return (
    <div className="space-y-6">
      <Card className="max-w-xl">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Emergency placement
          </p>
          <CardTitle className="mt-1 text-2xl">A furnished home, ready when it matters.</CardTitle>
          <CardDescription>
            Group urgent information into calm, readable surfaces with one clear next step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-2xl font-semibold">24/7</p>
              <p className="text-sm text-muted-foreground">Response</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-2xl font-semibold">48</p>
              <p className="text-sm text-muted-foreground">States covered</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Start a request</Button>
        </CardFooter>
      </Card>
      <Guidelines
        items={[
          { kind: 'do', text: 'Use a dark card surface to group related content without introducing a new color family.' },
          { kind: 'do', text: 'Give cards a clear header, readable body, and one primary footer action when a decision is needed.' },
          { kind: 'dont', text: 'Turn every section into a floating card or use gold as a large card fill.' },
        ]}
      />
    </div>
  );
}