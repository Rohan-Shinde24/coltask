'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted cookies
    const hasAccepted = localStorage.getItem('coltask_cookies_accepted');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('coltask_cookies_accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto bg-black text-white p-6 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
        <div className="text-sm font-medium text-white/80">
          We use cookies to improve your experience. By using our site, you agree to our{' '}
          <Link href="/privacy" className="text-white underline underline-offset-4 hover:text-[#0092d1] transition-colors">
            Privacy Policy
          </Link>
          .
        </div>
        <button
          onClick={acceptCookies}
          className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform shrink-0 w-full sm:w-auto"
        >
          Accept Cookies
        </button>
      </div>
    </div>
  );
}
