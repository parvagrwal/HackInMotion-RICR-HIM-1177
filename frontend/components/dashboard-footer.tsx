'use client';

export function DashboardFooter() {
  return (
    <footer className="mt-12 pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
      <div className="flex items-center gap-1.5">
        <span>🔒</span>
        <span>Your financial data is private and protected.</span>
      </div>

      <div className="flex items-center gap-6">
        <button className="hover:text-slate-600 transition-colors">Privacy</button>
        <button className="hover:text-slate-600 transition-colors">Security</button>
        <button className="hover:text-slate-600 transition-colors">Settings</button>
      </div>
    </footer>
  );
}
