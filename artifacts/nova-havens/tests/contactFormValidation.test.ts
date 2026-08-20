/**
 * Locks the Contact form's validation rules and messages in place.
 *
 * These used to come from a zod schema; the schema was replaced with a
 * hand-written resolver to keep the Contact route chunk small, so these
 * assertions guard against the behaviour drifting.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CONTACT_FORM_DEFAULT_VALUES,
  contactFormResolver,
  validateContactForm,
  type ContactFormValues,
} from '../src/lib/contactFormValidation.ts';

const VALID: ContactFormValues = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '',
  subject: 'General Inquiry',
  message: 'We need furnished housing for a displaced family.',
};

test('a complete submission passes with no errors', () => {
  assert.deepEqual(validateContactForm(VALID), {});
});

test('phone stays optional', () => {
  assert.deepEqual(validateContactForm({ ...VALID, phone: undefined }), {});
});

test('the empty form reports every required field', () => {
  assert.deepEqual(validateContactForm(CONTACT_FORM_DEFAULT_VALUES), {
    name: 'Name must be at least 2 characters',
    email: 'Please enter a valid email address',
    subject: 'Please select a subject',
    message: 'Message must be at least 10 characters',
  });
});

test('name needs at least two characters', () => {
  assert.equal(
    validateContactForm({ ...VALID, name: 'J' }).name,
    'Name must be at least 2 characters',
  );
  assert.equal(validateContactForm({ ...VALID, name: 'Jo' }).name, undefined);
});

test('message needs at least ten characters', () => {
  assert.equal(
    validateContactForm({ ...VALID, message: '123456789' }).message,
    'Message must be at least 10 characters',
  );
  assert.equal(
    validateContactForm({ ...VALID, message: '1234567890' }).message,
    undefined,
  );
});

test('email addresses are accepted or rejected as before', () => {
  const accepted = [
    'jane@example.com',
    'jane.doe+claims@sub.example.co.uk',
    "o'brien_1@example-hosting.com",
  ];
  const rejected = [
    '',
    'jane',
    'jane@',
    'jane@example',
    'jane@.com',
    '.jane@example.com',
    'jane..doe@example.com',
    'jane doe@example.com',
  ];

  for (const email of accepted) {
    assert.equal(
      validateContactForm({ ...VALID, email }).email,
      undefined,
      `expected ${email} to be accepted`,
    );
  }

  for (const email of rejected) {
    assert.equal(
      validateContactForm({ ...VALID, email }).email,
      'Please enter a valid email address',
      `expected ${email} to be rejected`,
    );
  }
});

test('the resolver reports react-hook-form shaped errors', async () => {
  const ok = await contactFormResolver(VALID, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
  });
  assert.deepEqual(ok.errors, {});
  assert.deepEqual(ok.values, VALID);

  const bad = await contactFormResolver(
    CONTACT_FORM_DEFAULT_VALUES,
    undefined,
    { fields: {}, shouldUseNativeValidation: false },
  );
  assert.deepEqual(bad.values, {});
  assert.deepEqual(bad.errors.subject, {
    type: 'validation',
    message: 'Please select a subject',
  });
});
