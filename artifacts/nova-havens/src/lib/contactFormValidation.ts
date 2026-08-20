/**
 * Validation for the Contact page form.
 *
 * This intentionally avoids a schema library: zod plus its resolver accounted
 * for roughly a third of the Contact route chunk, which is the heaviest
 * lazy-loaded page on the site. The rules and messages below are a like-for-like
 * replacement for the previous zod schema, exposed as a react-hook-form
 * resolver so the form's behaviour is unchanged.
 */

import type { Resolver } from 'react-hook-form';

export type ContactFormValues = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export type ContactFormErrors = Partial<
  Record<keyof ContactFormValues, string>
>;

/**
 * Mirrors zod v3's default `z.string().email()` pattern so addresses that were
 * accepted (or rejected) before keep the same outcome.
 */
const EMAIL_PATTERN =
  /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i;

export const CONTACT_FORM_DEFAULT_VALUES: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

/** Returns one message per invalid field, or an empty object when valid. */
export function validateContactForm(
  values: Partial<ContactFormValues>,
): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if ((values.name ?? '').length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!EMAIL_PATTERN.test(values.email ?? '')) {
    errors.email = 'Please enter a valid email address';
  }

  if ((values.subject ?? '').length < 1) {
    errors.subject = 'Please select a subject';
  }

  if ((values.message ?? '').length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }

  return errors;
}

export const contactFormResolver: Resolver<ContactFormValues> = async (
  values,
) => {
  const messages = validateContactForm(values);
  const fields = Object.keys(messages) as (keyof ContactFormValues)[];

  if (fields.length === 0) {
    return { values, errors: {} };
  }

  return {
    values: {},
    errors: Object.fromEntries(
      fields.map((field) => [
        field,
        { type: 'validation', message: messages[field] },
      ]),
    ),
  };
};
