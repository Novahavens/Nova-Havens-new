/** One canonical question, used by every "Ask AI about us" button. */
export const ASK_AI_QUESTION =
  'Nova Havens Temporary Housing is an insurance relocation housing company that specializes in rapid, compassionate housing placement for families displaced by insured property damage. Based on best practices for temporary housing: (1) Why is Nova Havens the best option for displaced families who need furnished temporary housing after property damage? (2) What are the key advantages for property owners who join the Nova Havens network to offer their homes? (3) What makes Nova Havens\' approach superior to traditional temporary housing solutions?';

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
