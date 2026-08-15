'use client';

import { useState, useRef, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { updateMonthlyIncome, updateUsername } from '@/app/dashboard/actions';
import { getTransactions } from '@/app/transactions/actions';

interface ProfilePopoverProps {
  userName: string;
  email: string;
  initialIncome?: number;
}

export function ProfilePopover({
  userName,
  email,
  initialIncome = 78000,
}: ProfilePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [incomeInput, setIncomeInput] = useState(initialIncome.toString());
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingIncome, setIsSavingIncome] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const popoverRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    setNameInput(userName);
  }, [userName]);

  useEffect(() => {
    if (initialIncome) {
      setIncomeInput(initialIncome.toString());
    }
  }, [initialIncome]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Save Username to Database and Auth Metadata
  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsSavingName(true);
    setStatusMsg('');
    try {
      const res = await updateUsername(nameInput.trim());
      if (res && !res.success) throw new Error('Failed to update username');
      setStatusMsg('Username saved to database!');
      setIsEditingName(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to update username.');
    } finally {
      setIsSavingName(false);
    }
  };

  // 2. Save Monthly Income
  const handleSaveIncome = async () => {
    const val = Number(incomeInput);
    if (!Number.isFinite(val) || val < 0) {
      setStatusMsg('Enter valid income.');
      return;
    }
    setIsSavingIncome(true);
    setStatusMsg('');
    try {
      await updateMonthlyIncome(val);
      setStatusMsg('Income baseline saved!');
      router.refresh();
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to save income.');
    } finally {
      setIsSavingIncome(false);
    }
  };

  // 3. Export CSV Data
  const handleExportData = async () => {
    setIsExporting(true);
    setStatusMsg('');
    try {
      const txs = await getTransactions();
      if (!txs || txs.length === 0) {
        setStatusMsg('No transactions to export.');
        return;
      }

      const headers = ['ID', 'Date', 'Description', 'Merchant', 'Amount', 'Type', 'Category'];
      const rows = txs.map((t) => [
        t.id,
        t.date,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${(t.merchant || '').replace(/"/g, '""')}"`,
        t.amount,
        t.type,
        t.category,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `finsight_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatusMsg('Data exported to CSV!');
    } catch (err) {
      console.error(err);
      setStatusMsg('Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  // 4. Logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const initials = userName ? userName.slice(0, 2).toUpperCase() : 'US';

  return (
    <div className="relative" ref={popoverRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs flex items-center justify-center shadow-sm transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
        title="Account Settings & Profile"
        aria-label="Account Settings & Profile"
      >
        {initials}
      </button>

      {/* Profile Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-88 rounded-3xl bg-white border border-slate-100 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-4 space-y-4">
          {/* Header & Username Edit */}
          <div className="p-4 bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#10172d] text-white font-bold text-sm flex items-center justify-center shadow-sm flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500/20"
                      placeholder="Username"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      className="px-2 py-1 bg-[#10172d] text-white rounded-lg text-[10px] font-bold hover:bg-[#18213d]"
                    >
                      {isSavingName ? '...' : 'Save'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#10172d] truncate">{userName}</p>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-[10px] text-teal-600 hover:underline font-semibold"
                      title="Change username"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-400 truncate mt-0.5">{email}</p>
              </div>
            </div>
          </div>

          {/* Feature 1: Monthly Income Baseline Editor */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50/60 border border-slate-100">
            <label className="text-xs font-bold text-[#10172d] flex justify-between items-center">
              <span>Monthly Income Baseline</span>
              <span className="text-[10px] text-slate-400 font-normal">Savings Baseline</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#10172d] outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="0"
                />
              </div>
              <button
                onClick={handleSaveIncome}
                disabled={isSavingIncome}
                className="px-3 py-1.5 bg-[#0d9488] text-white rounded-xl text-xs font-bold hover:bg-[#0f766e] transition-colors disabled:opacity-50"
              >
                {isSavingIncome ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>

          {/* Feature 2: Export Financial Data */}
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 hover:bg-slate-100/80 border border-slate-100 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <span className="text-base">📥</span>
              <div>
                <p className="text-xs font-bold text-[#10172d]">Export Data (CSV)</p>
                <p className="text-[10px] text-slate-400">Download backup of all transactions</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-[#10172d] transition-colors">
              {isExporting ? 'Exporting...' : '→'}
            </span>
          </button>

          {/* Status Message Display */}
          {statusMsg && (
            <p className="text-[11px] font-semibold text-center text-teal-700 bg-teal-50 py-1.5 rounded-xl">
              {statusMsg}
            </p>
          )}

          {/* Logout Action */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <span>🚪</span>
              <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
