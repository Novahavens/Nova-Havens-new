import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'wouter';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EXTERNAL_FORM_LINK_PROPS, INTAKE_FORMS } from '@/lib/intakeForms';
import {
  CONTACT_FORM_DEFAULT_VALUES,
  contactFormResolver,
  type ContactFormValues,
} from '@/lib/contactFormValidation';

type FormValues = ContactFormValues;

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  useEffect(() => {
    // Title/description/OG tags are applied centrally by useRouteMeta (App.tsx).
  }, []);

  const form = useForm<FormValues>({
    resolver: contactFormResolver,
    defaultValues: CONTACT_FORM_DEFAULT_VALUES
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Contact endpoint responded ${response.status}`);
      }

      // Only now has the message actually reached Nova Havens.
      setIsSubmitted(true);
    } catch {
      setSubmitError('Your message could not be sent to Nova Havens.');
    }
  };

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="bg-background pt-24 pb-16 px-4 md:px-8 border-b border-white/10">
        <div className="mx-auto max-w-site w-full">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">Contact Nova Havens</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6" data-testid="heading-contact-hero">
              Request Emergency Housing or Get in Touch
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed" data-testid="text-contact-subtitle">
              To request emergency furnished housing through Nova Havens, call <a href="tel:+16294010054" className="text-primary font-semibold hover:brightness-110 transition-colors">(629) 401-0054</a> or submit the form below. Nova Havens responds to urgent housing requests 24 hours a day, 7 days a week. For general inquiries, expect a response within one business day.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-8 max-w-site mx-auto w-full">
        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-card rounded-lg border border-white/10 p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-3 text-foreground">Displaced Family or Adjuster?</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              If you have an active insurance claim and need immediate furnished housing placement, Nova Havens responds 24/7. Start your request here.
            </p>
            <a href={INTAKE_FORMS.housing} {...EXTERNAL_FORM_LINK_PROPS} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:brightness-105 rounded-full px-8 py-3.5 w-full md:w-auto" data-testid="btn-action-request-housing">
              Request Housing Now
            </a>
          </div>
          
          <div className="bg-card rounded-lg border border-white/10 p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-3 text-foreground">Own a Furnished Property?</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Join the Nova Havens network of 20,000+ verified furnished homes and start hosting displaced families — with carrier billing handled entirely by Nova Havens.
            </p>
            <a href={INTAKE_FORMS.property} {...EXTERNAL_FORM_LINK_PROPS} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-primary text-primary hover:brightness-105 rounded-full px-8 py-3.5 w-full md:w-auto" data-testid="btn-action-submit-property">
              Submit Your Property
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8" id="contact-form">
          
          {/* Contact Info Side */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-lg border border-white/5 p-6 flex items-start gap-4" data-testid="card-contact-phone">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Phone — 24/7 for emergency claims</h3>
                <a href="tel:6294010054" className="text-lg font-bold text-foreground hover:text-primary transition-colors block">
                  (629) 401-0054
                </a>
                <h3 className="text-sm font-semibold text-muted-foreground mt-3 mb-1">After Hours Specialty Line</h3>
                <a href="tel:6292062360" className="text-lg font-bold text-foreground hover:text-primary transition-colors block" data-testid="link-contact-after-hours-phone">
                  (629) 206-2360
                </a>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-white/5 p-6 flex items-start gap-4" data-testid="card-contact-email">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Email — general inquiries</h3>
                <a href="mailto:info@novahavens.com" className="text-lg font-bold text-foreground hover:text-primary transition-colors block">
                  info@novahavens.com
                </a>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-white/5 p-6 flex items-start gap-4" data-testid="card-contact-location">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Headquarters</h3>
                <span className="text-lg font-bold text-foreground block">
                  Nashville, TN
                </span>
                <span className="text-sm text-muted-foreground">Serving all 48 contiguous US states</span>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-2 bg-card rounded-lg border border-white/10 p-8 md:p-10">
            <h2 className="text-2xl font-bold mb-2 text-foreground" data-testid="heading-form">Send a Message to Nova Havens</h2>
            <p className="text-sm text-muted-foreground mb-8">For urgent housing placements, call <a href="tel:+16294010054" className="text-primary font-semibold">(629) 401-0054</a> directly — 24/7.</p>
            
            {isSubmitted ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center" data-testid="message-success">
                <p className="text-primary font-bold text-lg mb-2">Thank you!</p>
                <p className="text-muted-foreground">Nova Havens has received your message and will be in touch within one business day. For urgent requests, call (629) 401-0054.</p>
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
                            <Input placeholder="John Doe" className="bg-background border-white/10 text-foreground" {...field} data-testid="input-name" />
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
                            <Input placeholder="john@example.com" type="email" className="bg-background border-white/10 text-foreground" {...field} data-testid="input-email" />
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
                            <Input placeholder="(555) 123-4567" className="bg-background border-white/10 text-foreground" {...field} data-testid="input-phone" />
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
                              <SelectTrigger className="bg-background border-white/10 text-foreground" data-testid="select-subject">
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-white/10 text-foreground">
                              <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                              <SelectItem value="Housing Request">Housing Request — Displaced Family or Adjuster</SelectItem>
                              <SelectItem value="Property Submission">Property Submission — Join the Network</SelectItem>
                              <SelectItem value="Partnership">Carrier or Partner Inquiry</SelectItem>
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
                            placeholder="Describe your housing need, claim details, property, or question — the more context you provide, the faster Nova Havens can help." 
                            className="bg-background border-white/10 text-foreground min-h-[var(--min-h-textarea)]" 
                            {...field} 
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {submitError && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4" role="alert" data-testid="message-submit-error">
                      <p className="text-sm text-foreground">
                        {submitError}{' '}Please try again, or call{' '}
                        <a href="tel:+16294010054" className="text-primary font-semibold hover:brightness-110 transition-colors">(629) 401-0054</a>
                        {' '}— Nova Havens answers 24/7.
                      </p>
                    </div>
                  )}

                  <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-full bg-primary text-primary-foreground hover:brightness-105 font-bold px-8 py-6 h-auto" data-testid="btn-submit-contact">
                    {form.formState.isSubmitting ? 'Sending…' : 'Send Message'}
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
