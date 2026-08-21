import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
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
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8 tracking-tight">Terms and Conditions</h1>
        <p className="text-black/60 mb-12">Last Updated: August 2026</p>

        <div className="space-y-8 text-black/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-heading font-bold text-black mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Coltask ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-black mb-4">2. Description of Service</h2>
            <p>
              Coltask provides Agile project management tools, including task boards, backlogs, and real-time encrypted messaging workspaces. We reserve the right to modify or discontinue any part of the service with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-black mb-4">3. User Responsibilities</h2>
            <p className="mb-2">As a user of Coltask, you agree to the following:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate and complete registration information.</li>
              <li>Maintain the security of your password and authentication credentials.</li>
              <li>Accept full responsibility for all activities that occur under your account.</li>
              <li>Do not use the platform for any illegal, harmful, or abusive activities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-black mb-4">4. Intellectual Property</h2>
            <p>
              All content included on this site, such as text, graphics, logos, button icons, images, and software, is the property of Coltask Inc. or its content suppliers and protected by international copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-black mb-4">5. Limitation of Liability</h2>
            <p>
              In no event shall Coltask, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
