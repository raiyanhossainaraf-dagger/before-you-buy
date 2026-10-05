import type { Metadata } from 'next';
import { LegalPlaceholder } from '../_components/legal-placeholder';

export const metadata: Metadata = { title: 'Terms of Service' };

/** LEGAL-09 */
export default function TermsPage() {
  return <LegalPlaceholder title="Terms of Service" />;
}
