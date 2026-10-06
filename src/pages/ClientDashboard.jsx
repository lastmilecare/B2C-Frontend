import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const clients = [
  {
    slug: "amp",
    name: "AMP",
    description:
      "Camp & patient analytics — gender, APL/BPL segmentation, geography, and complaints.",
    href: "/amp",
    accent: "border-emerald-200 bg-emerald-50/50",
  },
  {
    slug: "honda",
    name: "Honda",
    description:
      "Financial operations — revenue by service, trends, cost categories, and payroll.",
    href: "/honda",
    accent: "border-red-200 bg-red-50/50",
  },
];

export function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Shared dashboard module
      </h1>
      <p className="mt-3 text-muted leading-relaxed">
        This phase uses dummy data only. Charts, KPI cards, filters, and tables live in{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-800">
          src/common/dashboard
        </code>
        . Client routes compose that module with client-specific layouts and datasets.
      </p>
      <ul className="mt-8 space-y-4">
        {clients.map((c) => (
          <li key={c.slug}>
            <Link
              to={c.href}
              className={`group flex items-start justify-between gap-4 rounded-xl border p-5 transition-shadow hover:shadow-md ${c.accent}`}
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{c.name} Dashboard</h2>
                <p className="mt-1 text-sm text-slate-600">{c.description}</p>
              </div>
              <ArrowRight
                className="mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
