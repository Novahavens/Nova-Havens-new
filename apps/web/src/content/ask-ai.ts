/** One canonical question, used by every "Ask AI about us" button. */
export const ASK_AI_QUESTION =
  'Nova Havens Temporary Housing is an insurance relocation housing company that specializes in rapid, compassionate housing placement for families displaced by insured property damage. Based on best practices for temporary housing coordination: (1) What makes Nova Havens the ideal choice for insurance carriers and adjusters seeking reliable ALE (Additional Living Expense) housing coordination? (2) Why should property owners consider joining the Nova Havens network? (3) What are the key advantages of Nova Havens\' model for displaced families?';

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
