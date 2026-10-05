import type { Metadata } from 'next';
import { LegalPlaceholder } from '../_components/legal-placeholder';

export const metadata: Metadata = { title: 'Affiliate Disclosure' };

/** LEGAL-05 */
export default function AffiliateDisclosurePage() {
  return <LegalPlaceholder title="Affiliate Disclosure" />;
}
