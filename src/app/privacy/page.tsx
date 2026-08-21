import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fdfdfc] text-black font-sans selection:bg-black selection:text-white pb-24">
      <nav className="border-b border-black/5 bg-white">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity font-medium">
            <ArrowLeft size={20} /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 mt-16">
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8 tracking-tight">Privacy Policy</h1>
        <p className="text-black/60 mb-12">Last Updated: August 2026</p>

        <div className="space-y-8 text-black/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-heading font-bold text-black mb-4">1. Introduction</h2>
            <p>
              Welcome to Coltask. We respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our Agile project management and collaboration platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-black mb-4">2. End-to-End Encryption (E2EE)</h2>
            <p>
              At Coltask, your privacy is our priority. Our real-time chat feature utilizes industry-standard End-to-End Encryption (AES-GCM). 
              This means your messages are encrypted on your device and can only be decrypted by the intended recipients within your workspace. 
              Coltask servers only route the encrypted ciphertext and cannot read the contents of your messages under any circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-black mb-4">3. Data We Collect</h2>
            <p className="mb-2">We collect the following types of information to provide and improve our services:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, and authentication credentials.</li>
              <li><strong>Workspace Data:</strong> Task titles, descriptions, tags, and assignments within your project boards.</li>
              <li><strong>Usage Data:</strong> Technical logs and performance metrics to help us maintain system reliability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-black mb-4">4. How We Use Your Data</h2>
            <p>
              We use your data solely to provide the core functionalities of Coltask, such as managing your project boards, authenticating your access, and delivering system notifications. We never sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-black mb-4">5. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact our Data Protection Officer at privacy@coltask.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
