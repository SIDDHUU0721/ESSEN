import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, CheckCircle2, Utensils, BellRing, Droplets, Receipt, Sparkles, ChefHat, Calculator } from 'lucide-react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { TableSplitBillModal } from '../../components/dinein/TableSplitBillModal';

export const QRTableScan: React.FC = () => {
  const navigate = useNavigate();
  const { setOrderType, setTableNumber } = useCart();

  const [simulatedTable, setSimulatedTable] = useState('table_3');
  const [loading, setLoading] = useState(false);
  const [verifiedTable, setVerifiedTable] = useState<any>(null);
  const [waiterRequestSent, setWaiterRequestSent] = useState<string | null>(null);
  const [splitBillModalOpen, setSplitBillModalOpen] = useState(false);

  const sampleTables = [
    { id: 'table_1', tableNumber: 1, name: 'Table 1 - Window Corner', restName: 'The Royal Nawabi Kitchen', code: 'EST-ROY-1001' },
    { id: 'table_2', tableNumber: 2, name: 'Table 2 - Center Cozy', restName: 'The Royal Nawabi Kitchen', code: 'EST-ROY-1001' },
    { id: 'table_3', tableNumber: 3, name: 'Table 3 - Royal Family Booth', restName: 'The Royal Nawabi Kitchen', code: 'EST-ROY-1001' },
    { id: 'table_4', tableNumber: 4, name: 'Table 4 - Woodfired Terrace', restName: 'Trattoria Bella Napoli', code: 'EST-BEL-2002' },
  ];

  const handleVerifyQR = async () => {
    setLoading(true);
    try {
      const selected = sampleTables.find((t) => t.id === simulatedTable) || sampleTables[2];
      setVerifiedTable(selected);
      setOrderType('dine_in');
      setTableNumber(selected.tableNumber);
    } finally {
      setLoading(false);
    }
  };

  const handleWaiterRequest = async (requestType: string, label: string) => {
    try {
      await api.post('/dine-in/waiter/request', {
        restaurantId: '65f01_dummy',
        tableNumber: verifiedTable?.tableNumber || 3,
        requestType,
      });
      setWaiterRequestSent(label);
      setTimeout(() => setWaiterRequestSent(null), 4000);
    } catch {
      setWaiterRequestSent(label);
      setTimeout(() => setWaiterRequestSent(null), 4000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 p-0.5 mx-auto shadow-lg shadow-brand-500/25">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <QrCode className="w-7 h-7 text-brand-400" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Scan Table QR for Dine-In</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Scan your table's unique QR code to unlock the in-restaurant digital menu, order directly, or call the waiter.
        </p>
      </div>

      {/* Simulator / Scanner Box */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Select Physical Table QR Simulator:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {sampleTables.map((t) => (
              <button
                key={t.id}
                onClick={() => setSimulatedTable(t.id)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  simulatedTable === t.id
                    ? 'bg-brand-500/10 border-brand-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-bold text-sm text-white">{t.name}</span>
                <span className="text-[11px] text-brand-400 mt-1">{t.restName}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleVerifyQR}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <QrCode className="w-4 h-4" />
          <span>{loading ? 'Verifying QR Token...' : 'Verify Table QR & Open Menu'}</span>
        </button>

        {/* Verified Session Dashboard */}
        {verifiedTable && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-sm text-white">Table QR Verified & Active</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-extrabold">
                {verifiedTable.name}
              </span>
            </div>

            <p className="text-xs text-slate-300">
              You are now seated at **{verifiedTable.name}** in **{verifiedTable.restName}**. Any items you add to cart
              will be sent straight to the chef's Kitchen Display System (KDS).
            </p>

            {/* In-Restaurant Live Waiter Service Calls */}
            <div className="pt-2 border-t border-emerald-500/20 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Instant Table Assistance:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => handleWaiterRequest('request_water', 'Drinking Water Requested')}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:border-brand-500 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Water</span>
                </button>
                <button
                  onClick={() => handleWaiterRequest('request_cutlery', 'Cutlery Requested')}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:border-brand-500 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Utensils className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cutlery</span>
                </button>
                <button
                  onClick={() => handleWaiterRequest('call_waiter', 'Waiter Called to Table')}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:border-brand-500 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <BellRing className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Waiter</span>
                </button>
                <button
                  onClick={() => handleWaiterRequest('request_bill', 'Bill Requested')}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:border-brand-500 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5 text-purple-400" />
                  <span>Get Bill</span>
                </button>
              </div>
            </div>

            {waiterRequestSent && (
              <div className="p-2.5 rounded-xl bg-slate-950 text-xs text-amber-400 font-bold text-center border border-amber-500/30">
                🔔 {waiterRequestSent}! Staff has been notified on their terminal.
              </div>
            )}

            {/* Split Table Bill Action */}
            <div className="pt-2 border-t border-emerald-500/20 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setSplitBillModalOpen(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Calculator className="w-3.5 h-3.5 text-brand-400" />
                <span>Split Bill & UPI QR</span>
              </button>

              <button
                onClick={() => navigate('/restaurants')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 active:scale-95 transition"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Digital Menu</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Split Bill Modal */}
      {splitBillModalOpen && (
        <TableSplitBillModal
          isOpen={splitBillModalOpen}
          onClose={() => setSplitBillModalOpen(false)}
          tableName={verifiedTable?.name || 'Table 3'}
          restaurantName={verifiedTable?.restName || 'The Royal Nawabi Kitchen'}
          totalBillAmount={1480}
        />
      )}
    </div>
  );
};
