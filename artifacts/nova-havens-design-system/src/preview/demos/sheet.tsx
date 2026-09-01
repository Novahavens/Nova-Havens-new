import { Menu } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../../components/ui/sheet';
import { Guidelines } from '../parts';

export function SheetDemo() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6 text-card-foreground">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Menu /> Open mobile navigation
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>
                <span className="text-foreground">Nova</span>
                <span className="text-primary">Havens</span>
              </SheetTitle>
              <SheetDescription>
                Compact navigation remains available below the desktop breakpoint.
              </SheetDescription>
            </SheetHeader>
            <nav className="my-8 flex flex-col gap-5 text-lg font-medium">
              <a href="#overview">Home</a>
              <a href="#color-roles">Coverage</a>
              <a href="#form-field-kit">Contact</a>
            </nav>
            <SheetFooter>
              <SheetClose asChild>
                <Button>Request housing</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <Guidelines
        items={[
          { kind: 'do', text: 'Use the sheet for compact navigation at the mobile breakpoint while keeping primary actions visible.' },
          { kind: 'do', text: 'Provide a clear close affordance and preserve focus management from the dialog primitive.' },
          { kind: 'dont', text: 'Open the mobile panel by default or let it cover the first-use preview.' },
        ]}
      />
    </div>
  );
}