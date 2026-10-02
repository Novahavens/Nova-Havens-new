/**
 * Extracts Q&A pairs from a blog post body. FAQ sections follow the pattern:
 *
 *   ## Frequently Asked Questions
 *
 *   **Question text?**
 *   Answer text on the following line(s) of the same block.
 */
export function parseFaqsFromContent(content: string): { question: string; answer: string }[] {
  const blocks = content.split(/\n\n+/);
  const faqIdx = blocks.findIndex((b) => /^## Frequently Asked Questions/.test(b));
  if (faqIdx === -1) return [];

  const faqs: { question: string; answer: string }[] = [];
  for (let i = faqIdx + 1; i < blocks.length; i++) {
    const lines = (blocks[i] ?? '').split('\n');
    const firstLine = (lines[0] ?? '').trim();
    if (firstLine.startsWith('**') && firstLine.endsWith('**') && firstLine.includes('?')) {
      const question = firstLine.slice(2, -2);
      const answer = lines.slice(1).join(' ').trim();
      if (question && answer) faqs.push({ question, answer });
    }
  }
  return faqs;
}
