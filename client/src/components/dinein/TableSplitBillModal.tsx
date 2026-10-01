import React, { useState } from 'react';
import {
  X,
  Users,
  Calculator,
  QrCode,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  CreditCard,
  Sparkles,
  Share2,
} from 'lucide-react';

interface TableSplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: string;
  restaurantName: string;
  totalBillAmount?: number;
}

export const TableSplitBillModal: React.FC<TableSplitBillModalProps> = ({
  isOpen,
  onClose,
  tableName,
  restaurantName,
  totalBillAmount = 1480,
}) => {
  const [splitMode, setSplitMode] = useState<'EQUAL' | 'ITEMIZED'>('EQUAL');
  const [guestCount, setGuestCount] = useState<number>(4);
  const [copiedLink, setCopiedLink] = useState(false);

  // Status of each guest payment
  const [guestStatus, setGuestStatus] = useState<
    Array<{ name: string; isPaid: boolean }>
  >([
    { name: 'You (Aarav)', isPaid: true },
    { name: 'Priya', isPaid: false },
    { name: 'Vikram', isPaid: true },
    { name: 'Ananya', isPaid: false },
  ]);

  // Adjust guest list when guestCount changes
  const handleSetGuestCount = (count: number) => {
    setGuestCount(count);
    const names = ['You (Aarav)', 'Priya', 'Vikram', 'Ananya', 'Rohan', 'Sneha'];
    const updated = Array.from({ length: count }, (_, i) => ({
      name: names[i] || `Guest ${i + 1}`,
      isPaid: i === 0, // Current user defaulted to paid/host
    }));
    setGuestStatus(updated);
  };

  const toggleGuestPaid = (index: number) => {
    setGuestStatus((prev) =>
      prev.map((g, i) => (i === index ? { ...g, isPaid: !g.isPaid } : g))
    );
  };

  if (!isOpen) return null;

  // Equal Split Calculations
  const perPersonShare = Math.round((totalBillAmount / guestCount) * 10) / 10;
  const paidCount = guestStatus.filter((g) => g.isPaid).length;
  const totalCollected = Math.round(paidCount * perPersonShare);
  const remainingDue = Math.max(0, totalBillAmount - totalCollected);

  // UPI deep link
  const upiPayLink = `upi://pay?pa=essen@icici&pn=ESSEN_Dining&am=${perPersonShare}&cu=INR&tn=Table_Bill_Share`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiPayLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-6 z-10 ring-1 ring-brand-500/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Table Bill Split & Direct UPI
              </h3>
              <p className="text-xs text-slate-400">
                {tableName} • {restaurantName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Overview Banner */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Table Order Bill
            </span>
            <span className="text-2xl font-black text-white">
              ₹{totalBillAmount.toLocaleString()}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Per-Person Share
            </span>
            <span className="text-xl font-extrabold text-brand-400">
              ₹{perPersonShare.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Number of Diners Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-400" />
              <span>Number of Diners Splitting:</span>
            </span>
            <span className="text-amber-400 font-bold">{guestCount} Guests</span>
          </label>

          <div className="grid grid-cols-5 gap-2 text-xs">
            {[2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleSetGuestCount(num)}
                className={`py-2 rounded-xl border font-bold transition-all ${
                  guestCount === num
                    ? 'bg-brand-500 text-white border-brand-400 shadow-md shadow-brand-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {num} Diners
              </button>
            ))}
          </div>
        </div>

        {/* Diners Settlement Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">Diner Settlement Status:</span>
            <span className="text-[11px] text-slate-400">
              {paidCount} of {guestCount} Settled
            </span>
          </div>

          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {guestStatus.map((guest, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-white">{guest.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-brand-400 font-bold">
                    ₹{perPersonShare}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleGuestPaid(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                      guest.isPaid
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {guest.isPaid ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Paid</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        <span>Mark Paid</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UPI Payment Action & Share */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-950/40 via-slate-950 to-slate-950 border border-brand-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-brand-400" />
              <span>Instant UPI Share QR Code</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Zero Merchant Fee
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-md flex-shrink-0">
              {/* Stylized QR Matrix Pattern */}
              <div className="w-16 h-16 bg-slate-950 rounded-lg flex items-center justify-center p-1">
                <QrCode className="w-14 h-14 text-white" />
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <span className="text-xs text-slate-300 block truncate">
                Scan to pay exactly <strong>₹{perPersonShare}</strong> via GPay, PhonePe, or Paytm.
              </span>
              <span className="text-[10px] font-mono text-slate-500 block truncate">
                VPA: essen@icici
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyUPI}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition border border-slate-700 active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-brand-400" />
                  <span>Share UPI Link with Table</span>
                </>
              )}
            </button>

            <a
              href={upiPayLink}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition active:scale-95 whitespace-nowrap"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay ₹{perPersonShare}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
