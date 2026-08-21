import Link from 'next/link';
import { ArrowLeft, MonitorOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fdfdfc] text-black font-sans selection:bg-black selection:text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none mask-[radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-8 shadow-2xl">
          <MonitorOff size={32} className="text-white" />
        </div>
        
        <h1 className="text-8xl font-heading font-bold tracking-tight mb-2">404</h1>
        <h2 className="text-3xl font-heading font-bold mb-6">Page not found</h2>
        
        <p className="text-black/60 font-medium mb-10 text-lg leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Let's get you back to your workspace.
        </p>
        
        <Link 
          href="/" 
          className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:scale-105 transition-all flex items-center gap-3 shadow-xl"
        >
          <ArrowLeft size={20} /> Return Home
        </Link>
      </div>
    </div>
  );
}
