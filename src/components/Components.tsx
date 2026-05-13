import { Loader2 } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';

export function Chip({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'red' | 'green' | 'gray' }) {
  const colors = {
    blue: 'bg-blue-500/15 text-blue-100 border-blue-400/30',
    red: 'bg-red-500/15 text-red-100 border-red-400/30',
    green: 'bg-emerald-500/15 text-emerald-100 border-emerald-400/30',
    gray: 'bg-white/10 text-white/70 border-white/15',
  };
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${colors[tone]}`}>{children}</span>;
}

export function Card({ children, className = '', ...props }: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur ${className}`} {...props}>{children}</div>;
}

export function StatCard({ label, value, prefix = '', suffix = '', accent = 'blue' }: { label: string; value: number; prefix?: string; suffix?: string; accent?: 'blue' | 'red' }) {
  const count = useCountUp(value);
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${accent === 'red' ? 'bg-red-500' : 'bg-blue-500'} blur-3xl opacity-30`} />
      <p className="text-sm text-white/60">{label}</p>
      <div className="mt-3 text-3xl font-black tracking-tight text-white">{prefix}{Math.round(count).toLocaleString()}{suffix}</div>
    </Card>
  );
}

export function BarRow({ label, value, max, amount }: { label: string; value: number; max: number; amount?: string }) {
  const width = max ? Math.max(6, (value / max) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-white/85">{label}</span>
        <span className="text-white/55">{amount || value.toLocaleString()}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-red-500" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/75">{label}</span>
      <input {...inputProps} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-blue-400" />
    </label>
  );
}

export function Spinner() {
  return <div className="flex min-h-[240px] items-center justify-center"><Loader2 className="h-9 w-9 animate-spin text-blue-300" /></div>;
}

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-white/10 bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">{message}</div>;
}
