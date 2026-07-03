import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    FileText,
    Inbox,
    LineChart,
    Megaphone,
    Users,
} from 'lucide-react';
import { useState } from 'react';

const stats = [
    {
        label: 'Active tenders',
        value: 12,
        delta: '+2 this week',
        icon: FileText,
        iconBg: 'bg-emerald-50 text-emerald-600',
        spark: [8, 9, 10, 11, 10, 11, 12],
        sparkColor: '#059669',
    },
    {
        label: 'Pending complaints',
        value: 38,
        delta: '+5 today',
        icon: Inbox,
        iconBg: 'bg-red-50 text-red-600',
        spark: [28, 32, 30, 35, 33, 36, 38],
        sparkColor: '#dc2626',
    },
    {
        label: 'Total members',
        value: 24,
        delta: 'Term 2024–29',
        icon: Users,
        iconBg: 'bg-amber-50 text-amber-600',
        spark: [22, 22, 23, 23, 24, 24, 24],
        sparkColor: '#d97706',
    },
    {
        label: 'New notices',
        value: 7,
        delta: '+3 this week',
        icon: Megaphone,
        iconBg: 'bg-emerald-50 text-emerald-600',
        spark: [4, 5, 4, 6, 5, 6, 7],
        sparkColor: '#059669',
    },
];

const complaintsByMonth = [
    { label: 'Apr', value: 42 },
    { label: 'May', value: 55 },
    { label: 'Jun', value: 38 },
    { label: 'Jul', value: 62 },
    { label: 'Aug', value: 48 },
    { label: 'Sep', value: 71 },
];

const noticesByCategory = [
    { label: 'Administration', value: 18 },
    { label: 'Engineering', value: 14 },
    { label: 'Health', value: 9 },
    { label: 'Revenue', value: 11 },
];

const recentActivity = [
    {
        who: 'Md. Rahim',
        what: 'filed a new complaint',
        where: 'Ward 02 • Drainage',
        when: '5m ago',
    },
    {
        who: 'Admin',
        what: 'published notice',
        where: 'Holiday Notice — Eid',
        when: '1h ago',
    },
    {
        who: 'System',
        what: 'tender deadline approaching',
        where: 'PAB/2024/051',
        when: '3h ago',
    },
    {
        who: "Mayor's Office",
        what: 'approved member bio update',
        where: 'Councilor Karim',
        when: 'Yesterday',
    },
];

const quickActions = [
    {
        label: 'Add notice',
        href: () =>
            route('admin.content.edit', { kind: 'notice', id: 'new' }),
    },
    {
        label: 'Review complaints',
        href: () => route('admin.complaints.index'),
    },
    {
        label: 'Add member',
        href: () =>
            `${route('admin.members.index')}?openAddMember=1`,
    },
    {
        label: 'Manage templates',
        href: () => route('admin.templates.index'),
    },
];

const periodOptions = [
    'Sept 2025',
    'Aug 2025',
    'Jul 2025',
    'Jun 2025',
    'May 2026',
];

function initials(name) {
    return name
        .split(/\s+/)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

/** Small trend line for KPI cards */
function MiniSparkline({ values, color }) {
    const w = 72;
    const h = 22;
    const pad = 1;
    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const range = max - min || 1;
    const pts = values.map((v, i) => {
        const x =
            pad +
            (values.length === 1 ? w / 2 : (i / (values.length - 1)) * (w - pad * 2));
        const y = pad + (1 - (v - min) / range) * (h - pad * 2);
        return `${x},${y}`;
    });
    return (
        <svg
            width={w}
            height={h}
            className="shrink-0"
            viewBox={`0 0 ${w} ${h}`}
            aria-hidden
        >
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pts.join(' ')}
            />
        </svg>
    );
}

/** Area + line for complaints volume */
function ComplaintsTrendChart() {
    const w = 560;
    const h = 180;
    const padL = 36;
    const padR = 12;
    const padT = 16;
    const padB = 28;
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;
    const bottomY = padT + innerH;
    const max = Math.max(...complaintsByMonth.map((d) => d.value), 1);
    const points = complaintsByMonth.map((d, i) => {
        const x =
            padL +
            (complaintsByMonth.length === 1
                ? innerW / 2
                : (i / (complaintsByMonth.length - 1)) * innerW);
        const y = padT + innerH - (d.value / max) * innerH;
        return { x, y, label: d.label };
    });
    const areaPoints = `${points.map((p) => `${p.x},${p.y}`).join(' ')} ${points[points.length - 1].x},${bottomY} ${points[0].x},${bottomY}`;
    const lineD = points.map((p) => `${p.x},${p.y}`).join(' ');

    return (
        <svg
            viewBox={`0 0 ${w} ${h}`}
            className="h-44 w-full max-w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Complaints volume by month"
        >
            <defs>
                <linearGradient
                    id="dashChartFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop offset="0%" stopColor="#1a4731" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#1a4731" stopOpacity="0" />
                </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = padT + innerH * (1 - t);
                return (
                    <line
                        key={t}
                        x1={padL}
                        y1={y}
                        x2={w - padR}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                    />
                );
            })}
            <polygon fill="url(#dashChartFill)" points={areaPoints} />
            <polyline
                fill="none"
                stroke="#1a4731"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={lineD}
            />
            {points.map((p) => (
                <circle
                    key={p.label}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="white"
                    stroke="#1a4731"
                    strokeWidth="2"
                />
            ))}
            {points.map((p) => (
                <text
                    key={`t-${p.label}`}
                    x={p.x}
                    y={h - 6}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontWeight="500"
                >
                    {p.label}
                </text>
            ))}
        </svg>
    );
}

/** Horizontal bars for notices by category */
function CategoryBarChart() {
    const max = Math.max(...noticesByCategory.map((d) => d.value), 1);

    return (
        <div className="space-y-2.5" role="list">
            {noticesByCategory.map((row) => {
                const pct = (row.value / max) * 100;
                return (
                    <div key={row.label} className="flex items-center gap-3 text-sm">
                        <span className="w-28 shrink-0 truncate text-xs font-medium text-slate-600">
                            {row.label}
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="h-3.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-civic transition-all"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                        <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-800">
                            {row.value}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function AdminDashboard() {
    const user = usePage().props.auth?.user;
    const firstName = user?.name?.split(/\s+/)[0] ?? 'Admin';
    const [period, setPeriod] = useState(periodOptions[0]);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="mx-auto w-full max-w-6xl space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Welcome back, {firstName}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Here&apos;s what&apos;s happening across the
                            Pourashava today.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <LineChart
                            className="size-4 text-slate-400"
                            aria-hidden
                        />
                        <label className="sr-only" htmlFor="dash-period">
                            Reporting period
                        </label>
                        <select
                            id="dash-period"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                        >
                            {periodOptions.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((s) => {
                        const Icon = s.icon;
                        return (
                            <div
                                key={s.label}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        {s.label}
                                    </p>
                                    <div
                                        className={`grid size-9 shrink-0 place-items-center rounded-lg ${s.iconBg}`}
                                    >
                                        <Icon className="size-4" aria-hidden />
                                    </div>
                                </div>
                                <p className="mt-3 text-3xl font-bold tabular-nums text-slate-900">
                                    {s.value}
                                </p>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <p className="text-xs text-slate-500">
                                        {s.delta}
                                    </p>
                                    <MiniSparkline
                                        values={s.spark}
                                        color={s.sparkColor}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Complaints volume
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Sample trend for the selected period (demo
                                    data).
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 -mx-1">
                            <ComplaintsTrendChart />
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900">
                            Notices by department
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Published notices in the last 90 days (demo).
                        </p>
                        <div className="mt-5">
                            <CategoryBarChart />
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <h2 className="text-base font-semibold text-slate-900">
                            Recent activity
                        </h2>
                        <ul className="mt-4 divide-y divide-slate-100">
                            {recentActivity.map((a, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-3 py-3.5 first:pt-1"
                                >
                                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                        {initials(a.who)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-slate-800">
                                            <span className="font-semibold text-slate-900">
                                                {a.who}
                                            </span>{' '}
                                            {a.what}
                                        </p>
                                        <p className="truncate text-xs text-slate-500">
                                            {a.where}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs font-medium text-slate-400">
                                        {a.when}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900">
                            Quick actions
                        </h2>
                        <ul className="mt-4 space-y-2">
                            {quickActions.map((q) => (
                                <li key={q.label}>
                                    <Link
                                        href={q.href()}
                                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                                    >
                                        <span>{q.label}</span>
                                        <ArrowUpRight
                                            className="size-4 shrink-0 text-slate-400"
                                            aria-hidden
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <p className="text-center text-xs text-slate-400">
                    Figures, charts and activity are sample data for layout
                    preview.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
