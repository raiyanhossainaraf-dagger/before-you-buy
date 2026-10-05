import type { Metadata } from 'next';
import { LegalPlaceholder } from '../_components/legal-placeholder';

export const metadata: Metadata = { title: 'Privacy Policy' };

/** LEGAL-08 */
export default function PrivacyPage() {
  return <LegalPlaceholder title="Privacy Policy" />;
}
