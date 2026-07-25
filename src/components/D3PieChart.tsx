import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MetricType } from '../types';
import { formatCurrency } from '../utils/dataGenerator';

export interface PieDataItem {
  label: string;
  value: number;
  revenue: number;
  color: string;
  orderCount?: number;
}

interface D3PieChartProps {
  data: PieDataItem[];
  metric: MetricType;
  title?: string;
  height?: number;
}

export const D3PieChart: React.FC<D3PieChartProps> = ({
  data,
  metric,
  title = 'Sales Share Distribution',
  height = 320,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    item: PieDataItem | null;
    percentage: number;
    visible: boolean;
  }>({ x: 0, y: 0, item: null, percentage: 0, visible: false });

  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  const formatVal = (val: number) => {
    if (metric === 'revenue' || metric === 'avgOrderValue') {
      return formatCurrency(val);
    }
    return val.toLocaleString();
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const radius = Math.min(width, height) / 2 - 30;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Pie generator
    const pie = d3
      .pie<PieDataItem>()
      .value((d) => d.value)
      .sort(null);

    // Arc generator
    const arc = d3
      .arc<d3.PieArcDatum<PieDataItem>>()
      .innerRadius(0)
      .outerRadius(radius)
      .cornerRadius(3);

    const hoverArc = d3
      .arc<d3.PieArcDatum<PieDataItem>>()
      .innerRadius(0)
      .outerRadius(radius + 10)
      .cornerRadius(3);

    const pieData = pie(data);

    // Draw Slices
    const slices = g
      .selectAll('.slice')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'slice');

    const paths = slices
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer');

    // Percentage Labels on Slices (for slices >= 7%)
    slices
      .append('text')
      .attr('transform', (d) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#ffffff')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .text((d) => {
        const pct = totalValue > 0 ? (d.data.value / totalValue) * 100 : 0;
        return pct >= 7 ? `${pct.toFixed(0)}%` : '';
      });

    // Hover Events
    paths
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', hoverArc as any);

        setActiveSegment(d.data.label);
        const [mx, my] = d3.pointer(event, container);
        const pct = totalValue > 0 ? (d.data.value / totalValue) * 100 : 0;

        setTooltip({
          x: mx,
          y: my - 10,
          item: d.data,
          percentage: pct,
          visible: true,
        });
      })
      .on('mousemove', function (event, d) {
        const [mx, my] = d3.pointer(event, container);
        const pct = totalValue > 0 ? (d.data.value / totalValue) * 100 : 0;
        setTooltip({
          x: mx,
          y: my - 10,
          item: d.data,
          percentage: pct,
          visible: true,
        });
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc as any);

        setActiveSegment(null);
        setTooltip((prev) => ({ ...prev, visible: false }));
      });
  }, [data, metric, height, totalValue]);

  return (
    <div className="relative w-full bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-xl shadow-slate-950/40 flex flex-col justify-between" ref={containerRef}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
            <p className="text-xs text-slate-400">Proportional share breakdown</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-950 text-indigo-300 rounded-md border border-slate-800">
            Pie View
          </span>
        </div>

        <div className="w-full flex justify-center overflow-hidden">
          <svg ref={svgRef} className="overflow-visible"></svg>
        </div>
      </div>

      {/* Legend below chart */}
      <div className="mt-2 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {data.map((item) => {
          const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : '0';
          const isActive = activeSegment === item.label;

          return (
            <div
              key={item.label}
              className={`flex items-center gap-2 p-1.5 rounded-lg text-xs transition-all ${
                isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }}></span>
              <div className="truncate min-w-0">
                <div className="text-slate-200 truncate">{item.label}</div>
                <div className="text-slate-400 text-[10px] font-mono">{pct}%</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dark Tooltip */}
      {tooltip.visible && tooltip.item && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-slate-950 text-slate-100 p-2.5 rounded-xl shadow-2xl text-xs border border-slate-800 min-w-[140px]"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <div className="flex items-center gap-2 font-semibold border-b border-slate-800 pb-1 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: tooltip.item.color }}></span>
            <span>{tooltip.item.label}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Share:</span>
              <span className="font-bold text-amber-300">{tooltip.percentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Value:</span>
              <span className="font-semibold font-mono text-indigo-300">{formatVal(tooltip.item.value)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Revenue:</span>
              <span className="text-emerald-400 font-mono">{formatCurrency(tooltip.item.revenue)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
