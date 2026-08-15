import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { NotificationsPopover } from '@/components/notifications-popover';
import { ProfilePopover } from '@/components/profile-popover';
import { getNotifications } from '@/lib/analysis';
import { getUserProfile } from '@/app/dashboard/actions';
import { TransactionsClientContainer } from '@/components/transactions-client-container';

export default async function TransactionsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const userEmail = session.user?.email || '';

  const [userProfile, notifications] = await Promise.all([
    getUserProfile(),
    getNotifications(),
  ]);

  const userName = userProfile?.username || 'User';

  const indiaDateStr = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex min-h-screen bg-[#f5f8f8]">
      {/* Left Sidebar Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 px-6 md:px-10 py-8 max-w-7xl mx-auto space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-xs font-medium text-slate-400">{indiaDateStr}</div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#10172d] mt-1">
              Transactions & Imports
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <NotificationsPopover initialNotifications={notifications} />
            <ProfilePopover userName={userName} email={userEmail} initialIncome={userProfile?.monthlyIncome} />
          </div>
        </div>

        {/* Client Interactive Container for Forms & List */}
        <TransactionsClientContainer />
      </main>
    </div>
  );
}
