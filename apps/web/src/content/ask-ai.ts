/** One canonical question, used by every "Ask AI about us" button. */
export const ASK_AI_QUESTION =
  'What is Nova Havens Temporary Housing, the insurance relocation housing company, and how do they work with adjusters and displaced families?';

const ENCODED_QUESTION = encodeURIComponent(ASK_AI_QUESTION);

export interface AiAssistant {
  id: 'chatgpt' | 'claude' | 'perplexity';
  label: string;
  url: string;
}

export const AI_ASSISTANTS: AiAssistant[] = [
  { id: 'chatgpt', label: 'ChatGPT', url: `https://chatgpt.com/?q=${ENCODED_QUESTION}` },
  { id: 'claude', label: 'Claude', url: `https://claude.ai/new?q=${ENCODED_QUESTION}` },
  { id: 'perplexity', label: 'Perplexity', url: `https://www.perplexity.ai/search?q=${ENCODED_QUESTION}` },
];

export const AI_TRADEMARK_NOTICE =
  'ChatGPT, Claude and Perplexity are trademarks of their respective owners. Nova Havens is not affiliated with or endorsed by them.';
