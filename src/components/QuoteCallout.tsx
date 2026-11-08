import type { BlockquoteHTMLAttributes } from 'react';
import './components.css';

/** A short statement set apart with an accent rule. */
export function QuoteCallout({ className = '', ...props }: BlockquoteHTMLAttributes<HTMLQuoteElement>) {
  return <blockquote className={`cs-quote ${className}`.trim()} {...props} />;
}
