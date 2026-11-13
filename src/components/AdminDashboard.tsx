import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  DoorClosed,
  Users,
} from 'lucide-react';
import { Reservation, StudySpace, User } from '../types/unispace';
import { getAdminAnalyticsData } from '../utils/unispaceLogic';
import { OccupancyStatusBadge, ReservationStatusBadge } from './StatusBadge';

interface AdminDashboardProps {
  users: User[];
  spaces: StudySpace[];
  reservations: Reservation[];
  focusAnalytics?: boolean;
  onNavigateManageSpaces: () => void;
  onNavigateManageReservations: () => void;
}

export function AdminDashboard({
  users,
  spaces,
  reservations,
  focusAnalytics = false,
  onNavigateManageSpaces,
  onNavigateManageReservations,
}: AdminDashboardProps) {
  const analytics = getAdminAnalyticsData(users, spaces, reservations);

  const trendsCanvasRef = useRef<HTMLCanvasElement>(null);
  const popularCanvasRef = useRef<HTMLCanvasElement>(null);
  const typeCanvasRef = useRef<HTMLCanvasElement>(null);
  const analyticsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusAnalytics && analyticsSectionRef.current) {
      analyticsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [focusAnalytics]);

  useEffect(() => {
    const charts: Chart[] = [];
    const tickColor = '#000000';
    const labelColor = '#000000';
    const gridColor = 'rgba(15, 23, 42, 0.06)';

    if (trendsCanvasRef.current) {
      charts.push(
        new Chart(trendsCanvasRef.current, {
          type: 'line',
          data: {
            labels: analytics.trendLabels,
            datasets: [
              {
                label: 'Daily Reservations',
                data: analytics.trendCounts,
                borderColor: '#007AFF',
                backgroundColor: 'rgba(0, 122, 255, 0.14)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.38,
                pointBackgroundColor: '#007AFF',
                pointRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { precision: 0, color: tickColor, font: { size: 11 } },
                grid: { color: gridColor },
              },
              x: {
                ticks: { color: tickColor, font: { size: 11 } },
                grid: { display: false },
              },
            },
          },
        })
      );
    }

    if (popularCanvasRef.current) {
      charts.push(
        new Chart(popularCanvasRef.current, {
          type: 'bar',
          data: {
            labels: analytics.popularSpaces.map((p) => p.name),
            datasets: [
              {
                label: 'Total Bookings',
                data: analytics.popularSpaces.map((p) => p.count),
                backgroundColor: '#007AFF',
                borderRadius: 8,
                barThickness: 18,
              },
            ],
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: {
                beginAtZero: true,
                ticks: { precision: 0, color: tickColor, font: { size: 11 } },
                grid: { color: gridColor },
              },
              y: {
                ticks: { color: labelColor, font: { size: 11 } },
                grid: { display: false },
              },
            },
          },
        })
      );
    }

    if (typeCanvasRef.current) {
      charts.push(
        new Chart(typeCanvasRef.current, {
          type: 'doughnut',
          data: {
            labels: analytics.bySpaceType.map((t) => t.type),
            datasets: [
              {
                data: analytics.bySpaceType.map((t) => t.count),
                backgroundColor: ['#007AFF', '#1F9D55', '#FF9F0A', '#AF52DE'],
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.9)',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '64%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 10,
                  usePointStyle: true,
                  padding: 14,
                  color: labelColor,
                  font: { size: 11 },
                },
              },
            },
          },
        })
      );
    }

    return () => {
      charts.forEach((c) => c.destroy());
    };
  }, [
    analytics.trendLabels,
    analytics.trendCounts,
    analytics.popularSpaces,
    analytics.bySpaceType,
  ]);

  const recentReservations = [...reservations]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const summaryMetrics = [
    {
      label: 'Total Users',
      value: analytics.totalUsers,
      Icon: Users,
      valueClass: 'text-black',
      iconClass: 'text-[#007AFF]',
    },
    {
      label: 'Study Spaces',
      value: analytics.totalSpaces,
      Icon: Building2,
      valueClass: 'text-black',
      iconClass: 'text-[#007AFF]',
    },
    {
      label: 'Available Now',
      value: analytics.availableSpaces,
      Icon: CheckCircle2,
      valueClass: 'text-[#1F9D55]',
      iconClass: 'text-[#1F9D55]',
    },
    {
      label: 'Occupied Now',
      value: analytics.occupiedSpaces,
      Icon: DoorClosed,
      valueClass: 'text-[#D32F2F]',
      iconClass: 'text-[#D32F2F]',
    },
    {
      label: 'Reservations',
      value: analytics.totalReservations,
      Icon: CalendarCheck,
      valueClass: 'text-[#007AFF]',
      iconClass: 'text-[#007AFF]',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-black">
          Campus Overview
        </h2>
        <p className="mt-1.5 text-sm text-black max-w-xl leading-relaxed">
          Live room occupancy, booking volume, and study space utilization across campus.
        </p>
      </div>

      {/* Unified Glass Summary Strip */}
      <section
        aria-label="Administrator KPI Summary"
        className="liquid-glass rounded-[28px] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-900/[0.07]"
      >
        {summaryMetrics.map((metric) => (
          <div key={metric.label} className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-black">
                {metric.label}
              </p>
              <metric.Icon
                className={`w-4 h-4 shrink-0 ${metric.iconClass}`}
                aria-hidden="true"
              />
            </div>
            <p
              className={`mt-2 font-display text-2xl sm:text-3xl font-bold tabular-nums ${metric.valueClass}`}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </section>

      {/* Usage Analytics Charts (Chart.js) */}
      <div
        id="usage-analytics-section"
        ref={analyticsSectionRef}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        <section className="lg:col-span-5 liquid-glass rounded-[28px] p-5 sm:p-6">
          <h3 className="font-display text-sm font-bold text-black">
            Reservation Trends (7-Day Volume)
          </h3>
          <p className="text-xs text-black mt-0.5">
            Daily bookings across campus buildings
          </p>
          <div className="mt-4 h-60 relative" data-testid="chart-trends">
            <canvas ref={trendsCanvasRef} aria-label="Reservation trends chart" />
          </div>
        </section>

        <section className="lg:col-span-4 liquid-glass rounded-[28px] p-5 sm:p-6">
          <h3 className="font-display text-sm font-bold text-black">
            Popular Study Spaces
          </h3>
          <p className="text-xs text-black mt-0.5">
            Most frequently reserved rooms
          </p>
          <div className="mt-4 h-60 relative" data-testid="chart-popular">
            <canvas ref={popularCanvasRef} aria-label="Popular study spaces chart" />
          </div>
        </section>

        <section className="lg:col-span-3 liquid-glass rounded-[28px] p-5 sm:p-6">
          <h3 className="font-display text-sm font-bold text-black">
            By Space Type
          </h3>
          <p className="text-xs text-black mt-0.5">
            Distribution by category
          </p>
          <div className="mt-4 h-60 relative" data-testid="chart-types">
            <canvas ref={typeCanvasRef} aria-label="Reservations by space type chart" />
          </div>
        </section>
      </div>

      {/* Bottom Row: Recent Reservations + Room Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 liquid-glass rounded-[28px] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-900/[0.06] flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold text-black">
                Recent Reservations
              </h3>
              <p className="text-xs text-black mt-0.5">
                Latest bookings from students and lecturers
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateManageReservations}
              className="text-sm font-semibold text-[#007AFF] hover:underline cursor-pointer whitespace-nowrap"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900/[0.06] bg-slate-900/[0.025] text-[11px] font-semibold text-black">
                  <th className="py-3 px-5">Booking ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Study Space</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/[0.05] text-xs">
                {recentReservations.map((res) => {
                  const u = users.find((usr) => usr.id === res.userId);
                  const sp = spaces.find((s) => s.id === res.spaceId);
                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-slate-900/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono font-semibold text-black tabular-nums whitespace-nowrap">
                        {res.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-black block">
                          {u ? u.fullName : res.userId}
                        </span>
                        <span className="text-[11px] text-black">
                          {u?.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-black">
                        {sp ? sp.name : res.spaceId}
                      </td>
                      <td className="py-3.5 px-4 text-black tabular-nums whitespace-nowrap">
                        {res.date} · {res.startTime}–{res.endTime}
                      </td>
                      <td className="py-3.5 px-5">
                        <ReservationStatusBadge status={res.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lg:col-span-4 liquid-glass rounded-[28px] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-900/[0.06] flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold text-black">
                Room Status
              </h3>
              <p className="text-xs text-black mt-0.5">
                Live campus availability
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateManageSpaces}
              className="text-sm font-semibold text-[#007AFF] hover:underline cursor-pointer whitespace-nowrap"
            >
              Manage
            </button>
          </div>

          <div className="divide-y divide-slate-900/[0.05] flex-1">
            {spaces
              .filter((s) => s.isActive)
              .slice(0, 6)
              .map((sp) => (
                <div
                  key={sp.id}
                  className="px-6 py-3 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-black truncate">
                      {sp.name}
                    </p>
                    <p className="text-[11px] text-black truncate">
                      {sp.building} · Cap {sp.capacity}
                    </p>
                  </div>
                  <OccupancyStatusBadge status={sp.occupancyStatus} compact />
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
