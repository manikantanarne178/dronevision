import type { Rule } from "../../types/drawing";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

interface Props {
  rules: Rule[];
}

export default function RuleTable({ rules }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-600" />
          <h2 className="text-sm font-semibold text-slate-900">
            Development Control Regulations (DCR) Scrutiny
          </h2>
        </div>
        <span className="text-xs font-medium text-slate-500">
          {rules.length} Rules Evaluated
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3">Rule Clause</th>
              <th className="px-4 py-3">Verification Status</th>
              <th className="px-4 py-3">Scrutiny Diagnostics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {rules.map((rule, idx) => {
              const isPass = rule.status === "PASS";
              return (
                <tr key={rule.rule || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {rule.rule}
                  </td>
                  <td className="px-4 py-3">
                    {isPass ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Compliant
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-medium">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Non-Compliant
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {rule.reason || (isPass ? "Satisfies required statutory parameters." : "Violates minimum threshold requirements.")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}