import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Building2, CheckCircle2, CreditCard, Download, FileText, Loader2, ShieldCheck, Wallet } from 'lucide-react';
import type { PaystackBank, ResolvedAccount, RoyaltyPayoutPayload, Transaction } from '../lib/api';
import { api } from '../lib/api';
import { Card, Chip, Field, StatCard } from '../components/Components';

function downloadCsv(transactions: Transaction[]) {
  const paid = transactions.filter((t) => t.status === 'Paid').reduce((sum, t) => sum + Number(t.amount), 0);
  const processing = transactions.filter((t) => t.status === 'Processing').reduce((sum, t) => sum + Number(t.amount), 0);
  const headers = ['Date', 'Description', 'Method', 'Reference', 'Status', 'Amount'];
  const rows = transactions.map((t) => [
    new Date(t.transaction_date).toLocaleDateString(),
    t.description,
    t.method,
    t.reference,
    t.status,
    Number(t.amount).toFixed(2),
  ]);
  const summary = [
    ['ArtistDirect Royalty Statement'],
    [`Generated: ${new Date().toLocaleString()}`],
    [`Paid total: ${paid.toFixed(2)}`],
    [`Processing total: ${processing.toFixed(2)}`],
    [],
  ];
  const csv = [...summary, headers, ...rows]
    .map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `artistdirect-royalty-statement-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadHtmlStatement(transactions: Transaction[]) {
  const paid = transactions.filter((t) => t.status === 'Paid').reduce((sum, t) => sum + Number(t.amount), 0);
  const rows = transactions.map((t) => `<tr><td>${new Date(t.transaction_date).toLocaleDateString()}</td><td>${t.description}</td><td>${t.method}</td><td>${t.reference}</td><td>${t.status}</td><td style="text-align:right">$${Number(t.amount).toFixed(2)}</td></tr>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Royalty Statement</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{color:#1d4ed8}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#0f172a;color:white}.summary{padding:16px;background:#eef2ff;border-radius:12px}</style></head><body><h1>ArtistDirect Royalty Statement</h1><div class="summary"><strong>Generated:</strong> ${new Date().toLocaleString()}<br><strong>Confirmed paid royalties:</strong> $${paid.toFixed(2)}</div><table><thead><tr><th>Date</th><th>Description</th><th>Method</th><th>Reference</th><th>Status</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `artistdirect-royalty-statement-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function Transactions({ transactions, onRequestPayout }: { transactions: Transaction[]; onRequestPayout: (payload: { amount: number; method: string; note?: string }) => Promise<void> }) {
  const [banks, setBanks] = useState<PaystackBank[]>([]);
  const [amount, setAmount] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [email, setEmail] = useState('');
  const [narration, setNarration] = useState('Royalty payout');
  const [resolved, setResolved] = useState<ResolvedAccount | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [verifyingRef, setVerifyingRef] = useState('');

  const paid = transactions.filter((t) => t.status === 'Paid').reduce((s, t) => s + Number(t.amount), 0);
  const processing = transactions.filter((t) => t.status === 'Processing').reduce((s, t) => s + Number(t.amount), 0);
  const incoming = transactions.filter((t) => !t.description.toLowerCase().includes('payout request') && !t.description.toLowerCase().includes('paystack transfer')).reduce((s, t) => s + Number(t.amount), 0);
  const available = useMemo(() => Math.max(0, incoming - paid - processing), [incoming, paid, processing]);
  const safeBanks = Array.isArray(banks) ? banks : [];
  const selectedBank = safeBanks.find((bank) => bank.code === bankCode);

  useEffect(() => {
    const loadBanks = async () => {
      setLoadingBanks(true);
      try {
        const data = await api.paystackBanks();
        setBanks(data);
        if (data[0]) setBankCode(data[0].code);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load Paystack banks.');
      } finally {
        setLoadingBanks(false);
      }
    };
    loadBanks();
  }, []);

  const resolveAccount = async () => {
    setError('');
    setSuccess('');
    setResolved(null);
    if (!bankCode) return setError('Select the recipient bank.');
    if (!/^\d{10}$/.test(accountNumber)) return setError('Enter a valid 10-digit account number.');
    setResolving(true);
    try {
      const data = await api.resolvePaystackAccount({ bank_code: bankCode, account_number: accountNumber });
      setResolved(data);
      setSuccess(`Account confirmed: ${data.account_name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Paystack could not verify this account.');
    } finally {
      setResolving(false);
    }
  };

  const submitPaystackPayout = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 100) return setError('Minimum Paystack payout is 100.');
    if (numericAmount > available) return setError('Requested payout cannot exceed available royalty balance.');
    if (!/^\d{10}$/.test(accountNumber)) return setError('Enter a valid 10-digit account number.');
    if (!resolved?.account_name) return setError('Resolve and confirm the bank account before payout.');
    if (!email.includes('@')) return setError('Enter the recipient email for Paystack records.');

    const payload: RoyaltyPayoutPayload = {
      amount: numericAmount,
      bank_code: bankCode,
      bank_name: selectedBank?.name || 'Bank Account',
      account_number: accountNumber,
      account_name: resolved.account_name,
      email,
      narration,
    };

    setPaying(true);
    try {
      const result = await api.requestRoyaltyPayout(payload);
      setSuccess(result.message || `Payment ${result.status}. Reference: ${result.reference}`);
      await onRequestPayout({ amount: numericAmount, method: 'Paystack Transfer', note: `${resolved.account_name} · ${selectedBank?.name || 'Bank'} · ${result.reference}` });
      setAmount('');
      setAccountNumber('');
      setResolved(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Paystack payout could not be completed.');
    } finally {
      setPaying(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    setVerifyingRef(reference);
    setError('');
    setSuccess('');
    try {
      const result = await api.verifyRoyaltyPayout(reference);
      setSuccess(result.message || `Payment status: ${result.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify this payout.');
    } finally {
      setVerifyingRef('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available Royalties" value={available} prefix="₦" />
        <StatCard label="Paid Out" value={paid} prefix="₦" accent="blue" />
        <StatCard label="Processing" value={processing} prefix="₦" accent="red" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-red-600"><CreditCard className="h-6 w-6 text-white" /></div>
            <div>
              <h2 className="text-xl font-black text-white">Paystack royalty payout</h2>
              <p className="mt-1 text-sm text-white/55">Send confirmed royalties directly to the artist’s bank account through Paystack Transfers.</p>
            </div>
          </div>

        <form onSubmit={submitPaystackPayout} className="mt-6 space-y-4">
          <Field label="Payout amount (NGN)" type="number" min="100" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/75">Recipient bank</span>
            <select value={bankCode} onChange={(e) => { setBankCode(e.target.value); setResolved(null); }} disabled={loadingBanks} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-blue-400">
              {loadingBanks && <option>Loading Paystack banks...</option>}
              {safeBanks.map((bank) => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Field label="Account number" inputMode="numeric" maxLength={10} value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); setResolved(null); }} placeholder="0123456789" />
            <button type="button" onClick={resolveAccount} disabled={resolving} className="mt-7 flex items-center justify-center gap-2 rounded-2xl border border-blue-400/30 px-5 py-3 font-black text-blue-100 hover:bg-blue-500/10 disabled:opacity-60"><Building2 className="h-4 w-4" /> {resolving ? 'Checking...' : 'Resolve'}</button>
          </div>
          {resolved && <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100"><CheckCircle2 className="mb-2 h-5 w-5" /> Account confirmed: <b>{resolved.account_name}</b></div>}
          <Field label="Recipient email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="artist@example.com" />
          <Field label="Narration" value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="Royalty payout" />
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/62"><ShieldCheck className="mb-2 h-5 w-5 text-blue-200" /> Payouts are confirmed by Paystack from the backend using your protected secret key. Never expose the secret key in the browser.</div>
          {error && <p className="flex gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm font-semibold text-red-100"><AlertCircle className="h-5 w-5 shrink-0" /> {error}</p>}
          {success && <p className="flex gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-100"><CheckCircle2 className="h-5 w-5 shrink-0" /> {success}</p>}
          <button disabled={paying} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-red-600 px-5 py-4 font-black text-white disabled:opacity-60"><Wallet className="h-5 w-5" /> {paying ? 'Sending via Paystack...' : 'Confirm & send payout'}</button>
        </form>
      </Card>

      <Card>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-xl font-black text-white">Royalty statement</h2><p className="text-sm text-white/50">Download statements and verify Paystack payout references.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row"><button onClick={() => downloadCsv(transactions)} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-black text-white hover:bg-white/10"><Download className="h-4 w-4" /> CSV</button><button onClick={() => downloadHtmlStatement(transactions)} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-black text-white hover:bg-white/10"><FileText className="h-4 w-4" /> Statement</button></div>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-white/[0.06] text-white/50"><tr><th className="p-4">Date</th><th>Description</th><th>Method</th><th>Reference</th><th>Status</th><th className="text-right">Amount</th><th className="pr-4 text-right">Action</th></tr></thead>
            <tbody>{transactions.map((t) => <tr key={t.id} className="border-t border-white/10 text-white/78"><td className="p-4">{new Date(t.transaction_date).toLocaleDateString()}</td><td className="max-w-[280px] font-semibold text-white">{t.description}</td><td>{t.method}</td><td className="font-mono text-xs">{t.reference}</td><td><Chip tone={t.status === 'Paid' ? 'green' : t.status === 'Processing' ? 'blue' : 'gray'}>{t.status}</Chip></td><td className="text-right font-black text-white">₦{Number(t.amount).toLocaleString()}</td><td className="pr-4 text-right">{t.method.includes('Paystack') ? <button onClick={() => verifyPayment(t.reference)} disabled={verifyingRef === t.reference} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-blue-100 hover:bg-white/10">{verifyingRef === t.reference ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Verify'}</button> : <span className="text-white/25">—</span>}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  );
}
