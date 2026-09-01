import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { Guidelines } from '../parts';

export function TabsDemo() {
  return (
    <div className="space-y-6">
      <div className="max-w-xl rounded-xl border bg-card p-6 text-card-foreground">
        <Tabs defaultValue="family">
          <TabsList>
            <TabsTrigger value="family">Displaced family</TabsTrigger>
            <TabsTrigger value="adjuster">Adjuster</TabsTrigger>
            <TabsTrigger value="owner">Property owner</TabsTrigger>
          </TabsList>
          <TabsContent value="family" className="rounded-md border p-4 text-sm">
            Find an available furnished home and request placement support.
          </TabsContent>
          <TabsContent value="adjuster" className="rounded-md border p-4 text-sm">
            Coordinate housing quickly with a team that understands ALE.
          </TabsContent>
          <TabsContent value="owner" className="rounded-md border p-4 text-sm">
            Share a verified home with the Nova Havens network.
          </TabsContent>
        </Tabs>
      </div>
      <Guidelines
        items={[
          { kind: 'do', text: 'Use tabs for related audience paths that share the same page context.' },
          { kind: 'do', text: 'Keep labels concrete and audience-first so the next step is obvious.' },
          { kind: 'dont', text: 'Use tabs for unrelated destinations that belong in navigation.' },
        ]}
      />
    </div>
  );
}