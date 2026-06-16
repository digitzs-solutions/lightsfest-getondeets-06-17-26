import { useEffect, useState } from 'react';
import { X, Activity, Shield, TrendingUp, DollarSign, ChevronDown, Zap } from 'lucide-react';

interface TLCSidebarProps {
  open: boolean;
  onClose: () => void;
}

const METRICS = [
  { label: 'Ad Spend Waste Prevented', value: '$7,140', icon: TrendingUp, pct: 31 },
  { label: 'Chargeback Fees Blocked', value: '$6,206', icon: Shield, pct: 27 },
  { label: 'Friendly Fraud Eliminated', value: '$9,985', icon: Activity, pct: 42 },
];

const ROUTES = [
  { id: 'stripe', label: 'Stripe Production Rails', detail: 'App Key: AK941x3f...' },
  { id: 'propay', label: 'ProPay Vault Matrix Channels', detail: 'Vault ID: PV-8827x...' },
];

export default function TLCSidebar({ open, onClose }: TLCSidebarProps) {
  const [logLines, setLogLines] = useState<string[]>([]);
  const [metricsVisible, setMetricsVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(ROUTES[0].id);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [barWidths, setBarWidths] = useState([0, 0, 0]);

  useEffect(() => {
    if (!open) {
      setLogLines([]);
      setMetricsVisible(false);
      setBarWidths([0, 0, 0]);
      return;
    }

    const lines = [
      '[SYS] TLC Engine v2.4 initializing...',
      '[TPG] TokenEx rail connected (sixFourAndToken)',
      '[TPG] Kount device fingerprint acquired',
      '[NET] IP geolocation resolved: Austin, TX',
      '[TSK] TicketSocket inventory sync confirmed',
      '[PAY] PayVia auth token cached (55m TTL)',
      '[FRD] Analyzing 90-day chargeback vectors...',
      '[REC] Calculating capital recovery baseline...',
      '[SYS] ================================',
      '[SYS] RECOVERY REPORT COMPILED',
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setLogLines((prev) => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setMetricsVisible(true);
          setTimeout(() => setBarWidths(METRICS.map(m => m.pct)), 300);
        }, 400);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [open]);

  const activeRoute = ROUTES.find(r => r.id === selectedRoute)!;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-[3px] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[440px] z-[70] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full bg-[#0f1117]/95 backdrop-blur-2xl border-l border-white/[0.06] flex flex-col shadow-[-30px_0_80px_rgba(0,0,0,0.4)]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04]">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <h2 className="text-xs font-semibold text-white tracking-wide uppercase">
                  TLC Audit Panel
                </h2>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 tracking-wide">
                Total Transaction Lifecycle Control
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* Routing Dropdown */}
            <div className="relative">
              <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-2">
                Outbound Routing Channel
              </label>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-left hover:bg-white/[0.05] transition-colors"
              >
                <div>
                  <div className="text-xs font-medium text-white">{activeRoute.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{activeRoute.detail}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1a1d27] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl z-10">
                  {ROUTES.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => { setSelectedRoute(route.id); setDropdownOpen(false); }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/[0.04] transition-colors flex items-center justify-between ${
                        selectedRoute === route.id ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      <div>
                        <div className="text-xs font-medium text-white">{route.label}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{route.detail}</div>
                      </div>
                      {selectedRoute === route.id && (
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Terminal Console */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-2">
                Live Processing Log
              </label>
              <div className="bg-black/60 rounded-xl border border-white/[0.04] p-4 min-h-[200px] max-h-[240px] overflow-y-auto font-mono text-[10px] leading-[1.8]">
                {logLines.map((line, i) => (
                  <div
                    key={i}
                    className={`${
                      line.includes('REPORT') ? 'text-emerald-400 font-semibold' :
                      line.includes('====') ? 'text-slate-600' :
                      line.includes('[SYS]') ? 'text-blue-400/70' :
                      line.includes('[TPG]') ? 'text-violet-400/70' :
                      line.includes('[PAY]') ? 'text-amber-400/70' :
                      line.includes('[FRD]') ? 'text-rose-400/70' :
                      line.includes('[REC]') ? 'text-emerald-400/70' :
                      'text-slate-400'
                    }`}
                  >
                    {line}
                  </div>
                ))}
                {logLines.length > 0 && logLines.length < 10 && (
                  <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse" />
                )}
              </div>
            </div>

            {/* Recovery Metrics */}
            <div
              className={`space-y-3 transition-all duration-700 ${
                metricsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
              }`}
            >
              <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                Monthly Capital Recovery
              </label>

              {METRICS.map((metric, i) => (
                <div
                  key={metric.label}
                  className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4"
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <metric.icon className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <span className="text-[11px] text-slate-300">{metric.label}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono">+{metric.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out"
                      style={{ width: `${barWidths[i]}%` }}
                    />
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-white/[0.04]">
                <div className="bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-emerald-400/70 font-medium">Total Recovery</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Monthly recurring</div>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-emerald-300 font-mono tracking-tight">+$23,331</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-white/[0.04]">
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-slate-600 tracking-wide">
                TLC Engine v2.4 &middot; PayVia Intelligence
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] text-emerald-400/70 font-medium">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
