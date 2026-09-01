import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { NativeSelect } from '../../components/ui/native-select';
import { Textarea } from '../../components/ui/textarea';
import { Guidelines } from '../parts';

type RequestForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function FormDemo() {
  const form = useForm<RequestForm>({
    defaultValues: { name: '', email: '', subject: '', message: '' },
    mode: 'onSubmit',
  });

  return (
    <div className="space-y-6">
      <div className="max-w-xl rounded-xl border bg-card p-6 text-card-foreground">
        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(() => undefined)}
          >
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Please enter your name.' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormDescription>Who should Nova Havens contact?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: 'Please enter your email.',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email.' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              rules={{ required: 'Choose a request type.' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request type</FormLabel>
                  <FormControl>
                    <NativeSelect placeholder="Choose one" {...field}>
                      <option value="housing">Emergency housing</option>
                      <option value="property">List a furnished property</option>
                      <option value="general">General inquiry</option>
                    </NativeSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              rules={{ required: 'Tell us a little more.' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="How can we help?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Send message</Button>
          </form>
        </Form>
      </div>
      <Guidelines
        items={[
          { kind: 'do', text: 'Keep labels, descriptions, and error messages connected to controls with visible focus states.' },
          { kind: 'do', text: 'Use a native select when a mobile picker and baseline accessibility matter.' },
          { kind: 'dont', text: 'Replace the field kit with visually similar controls that lose the source’s generated relationships.' },
        ]}
      />
    </div>
  );
}