import Link from 'next/link';
import { LayoutDashboard, Users, Settings, ArrowLeft, Search, BookOpen, Layers, Target, Activity } from 'lucide-react';
import prisma from '@/lib/prisma';
import SearchModal from '@/components/SearchModal';
import { WorkshopSidebar } from '@/components/WorkshopSidebar';

export default async function WorkshopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Fetch workshop name for the sidebar
  const workshop = await prisma.workshop.findUnique({
    where: { id },
    select: { name: true }
  });

  return (
    <div className="min-h-screen bg-base-200 flex flex-col md:flex-row">
      {/* Dynamic Sidebar */}
      <WorkshopSidebar id={id} workshopName={workshop?.name || 'Project'} />

      {/* Main Content */}
      <main className="flex-1 bg-white overflow-hidden flex flex-col h-screen">
        <div className="flex-1 overflow-auto bg-[#f5f7f9]">
           {children}
        </div>
      </main>
    </div>
  );
}
