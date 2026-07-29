/**
 * askAi.ts — shared config for the "Ask AI About Us" component.
 *
 * One canonical question, defined once and used by every assistant button.
 * Gemini does not reliably support a URL prefill parameter, so it is flagged
 * `copyToClipboard` — the component copies the question and opens the app
 * without pretending a query param worked.
 */

export const ASK_AI_QUESTION =
  'What is Nova Havens Temporary Housing, the insurance relocation housing company, and how do they work with adjusters and displaced families?';

const ENCODED_QUESTION = encodeURIComponent(ASK_AI_QUESTION);

export interface AiAssistant {
  id: 'chatgpt' | 'claude' | 'perplexity' | 'gemini';
  label: string;
  url: string;
  /** True when the target cannot prefill from the URL — copy the question first. */
  copyToClipboard: boolean;
}

export const AI_ASSISTANTS: AiAssistant[] = [
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    url: `https://chatgpt.com/?q=${ENCODED_QUESTION}`,
    copyToClipboard: false,
  },
  {
    id: 'claude',
    label: 'Claude',
    url: `https://claude.ai/new?q=${ENCODED_QUESTION}`,
    copyToClipboard: false,
  },
  {
    id: 'perplexity',
    label: 'Perplexity',
    url: `https://www.perplexity.ai/search?q=${ENCODED_QUESTION}`,
    copyToClipboard: false,
  },
  {
    id: 'gemini',
    label: 'Gemini',
    url: 'https://gemini.google.com/app',
    copyToClipboard: true,
  },
];

export const AI_TRADEMARK_NOTICE =
  'ChatGPT, Claude, Gemini and Perplexity are trademarks of their respective owners. Nova Havens is not affiliated with or endorsed by them.';
