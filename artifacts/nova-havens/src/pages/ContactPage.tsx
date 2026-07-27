import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'wouter';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  useEffect(() => {
    document.title = "Contact | Nova Havens";
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Contact Nova Havens to request emergency furnished housing, submit your property, or partner with our nationwide insurance relocation network. We respond within one business day.');
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'Contact Nova Havens to request emergency furnished housing, submit your property, or partner with our nationwide insurance relocation network. We respond within one business day.');
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', 'Contact Nova Havens to request emergency furnished housing, submit your property, or partner with our nationwide insurance relocation network. We respond within one business day.');
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    }
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form data:", data);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 500);
  };

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="bg-background pt-24 pb-16 px-4 md:px-8 border-b border-white/10">
        <div className="mx-auto max-w-[1200px] w-full text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6" data-testid="heading-contact-hero">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-contact-subtitle">
            Have a question? We're here to help.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-card rounded-[16px] border border-white/10 p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-3 text-foreground">Need Housing Now?</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              If you have a claim and need immediate placement, let's get your request started.
            </p>
            <Link href="#" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-[#0A0C10] hover:brightness-105 rounded-full px-8 py-3.5 w-full md:w-auto" data-testid="btn-action-request-housing">
              Request Housing
            </Link>
          </div>
          
          <div className="bg-card rounded-[16px] border border-white/10 p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-3 text-foreground">Own a Property?</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Join our network of verified furnished homes and start hosting displaced families.
            </p>
            <Link href="#" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-primary text-primary hover:brightness-105 rounded-full px-8 py-3.5 w-full md:w-auto" data-testid="btn-action-submit-property">
              Submit Your Property
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
          
          {/* Contact Info Side */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-[16px] border border-white/5 p-6 flex items-start gap-4" data-testid="card-contact-phone">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Phone</h3>
                <a href="tel:6294010054" className="text-lg font-bold text-foreground hover:text-primary transition-colors block">
                  (629) 401-0054
                </a>
              </div>
            </div>

            <div className="bg-card rounded-[16px] border border-white/5 p-6 flex items-start gap-4" data-testid="card-contact-email">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Email</h3>
                <a href="mailto:info@novahavens.com" className="text-lg font-bold text-foreground hover:text-primary transition-colors block">
                  info@novahavens.com
                </a>
              </div>
            </div>

            <div className="bg-card rounded-[16px] border border-white/5 p-6 flex items-start gap-4" data-testid="card-contact-location">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Location</h3>
                <span className="text-lg font-bold text-foreground block">
                  Nashville, TN
                </span>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-2 bg-card rounded-[16px] border border-white/10 p-8 md:p-10">
            <h2 className="text-2xl font-bold mb-8 text-foreground" data-testid="heading-form">Send a Message</h2>
            
            {isSubmitted ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center" data-testid="message-success">
                <p className="text-primary font-bold text-lg mb-2">Thank you!</p>
                <p className="text-muted-foreground">We've received your message and will be in touch within one business day.</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="bg-[#0A0C10] border-white/10 text-foreground" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" type="email" className="bg-[#0A0C10] border-white/10 text-foreground" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" className="bg-[#0A0C10] border-white/10 text-foreground" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Subject *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-[#0A0C10] border-white/10 text-foreground" data-testid="select-subject">
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-white/10 text-foreground">
                              <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                              <SelectItem value="Housing Request">Housing Request</SelectItem>
                              <SelectItem value="Property Submission">Property Submission</SelectItem>
                              <SelectItem value="Partnership">Partnership</SelectItem>
                              <SelectItem value="Press">Press</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Message *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="How can we help you?" 
                            className="bg-[#0A0C10] border-white/10 text-foreground min-h-[150px]" 
                            {...field} 
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="rounded-full bg-primary text-[#0A0C10] hover:brightness-105 font-bold px-8 py-6 h-auto" data-testid="btn-submit-contact">
                    Send Message
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
