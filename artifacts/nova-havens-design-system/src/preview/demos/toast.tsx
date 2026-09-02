import { Bell, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ToastAction } from '../../components/ui/toast';
import { Toaster } from '../../components/ui/toaster';
import { toast, useToast } from '../../hooks/use-toast';
import { Guidelines } from '../parts';

function ToastActionsDemo() {
  const { dismiss } = useToast();

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() =>
          toast({
            title: 'Housing request received',
            description: 'A placement specialist will follow up shortly.',
          })
        }
      >
        <Bell /> Show confirmation
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            variant: 'destructive',
            title: 'Could not save changes',
            description: 'Check your connection and try again.',
            action: (
              <ToastAction altText="Try saving again" onClick={() => dismiss()}>
                Retry
              </ToastAction>
            ),
          })
        }
      >
        <RotateCcw /> Show action toast
      </Button>
    </div>
  );
}

export function ToastDemo() {
  return (
    <div className="space-y-6">
      <div className="relative min-h-40 rounded-xl border bg-card p-6 text-card-foreground">
        <ToastActionsDemo />
        <Toaster />
      </div>
      <Guidelines
        items={[
          {
            kind: 'do',
            text: 'Use a toast for brief, non-blocking feedback and provide a clear action when recovery is useful.',
          },
          {
            kind: 'do',
            text: 'Keep the viewport provider mounted once at the app shell so notifications remain visible across page changes.',
          },
          {
            kind: 'dont',
            text: 'Put required instructions, long-form content, or multiple competing messages in a single toast.',
          },
        ]}
      />
    </div>
  );
}