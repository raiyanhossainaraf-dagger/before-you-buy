import type { Metadata } from 'next';
import { LegalPlaceholder } from '../_components/legal-placeholder';

export const metadata: Metadata = { title: 'Pre-order Terms' };

/** LEGAL-10 */
export default function PreorderTermsPage() {
  return <LegalPlaceholder title="Pre-order Terms" />;
}
