import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MetricType } from '../types';
import { formatCurrency } from '../utils/dataGenerator';

export interface DonutDataItem {
  label: string;
  value: number;
  revenue: number;
  color: string;
  orderCount?: number;
}

interface D3DonutChartProps {
  data: DonutDataItem[];
  metric: MetricType;
  title?: string;
  height?: number;
  innerRadiusRatio?: number; // default 0.6
}

export const D3DonutChart: React.FC<D3DonutChartProps> = ({
  data,
  metric,
  title = 'Real-Time Revenue Donut',
  height = 320,
  innerRadiusRatio = 0.6,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredData, setHoveredData] = useState<{
    label: string;
    value: number;
    percentage: number;
    color: string;
  } | null>(null);

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    item: DonutDataItem | null;
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
    const outerRadius = Math.min(width, height) / 2 - 25;
    const innerRadius = outerRadius * innerRadiusRatio;

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
      .pie<DonutDataItem>()
      .value((d) => d.value)
      .sort(null);

    // Arc generator
    const arc = d3
      .arc<d3.PieArcDatum<DonutDataItem>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(4)
      .padAngle(0.02);

    const hoverArc = d3
      .arc<d3.PieArcDatum<DonutDataItem>>()
      .innerRadius(innerRadius - 4)
      .outerRadius(outerRadius + 8)
      .cornerRadius(4)
      .padAngle(0.02);

    const pieData = pie(data);

    // Draw Slices
    const paths = g
      .selectAll('.donut-slice')
      .data(pieData)
      .enter()
      .append('path')
      .attr('class', 'donut-slice')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer');

    // Hover Events
    paths
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', hoverArc as any);

        const pct = totalValue > 0 ? (d.data.value / totalValue) * 100 : 0;
        setHoveredData({
          label: d.data.label,
          value: d.data.value,
          percentage: pct,
          color: d.data.color,
        });

        const [mx, my] = d3.pointer(event, container);
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

        setHoveredData(null);
        setTooltip((prev) => ({ ...prev, visible: false }));
      });
  }, [data, metric, height, innerRadiusRatio, totalValue]);

  return (
    <div className="relative w-full bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-xl shadow-slate-950/40 flex flex-col justify-between" ref={containerRef}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
            <p className="text-xs text-slate-400">Real-time segment proportions</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-950 text-indigo-300 rounded-md border border-slate-800">
            Donut View
          </span>
        </div>

        <div className="relative w-full flex justify-center items-center overflow-hidden">
          <svg ref={svgRef} className="overflow-visible"></svg>

          {/* Center Callout inside Donut Hole */}
          <div className="absolute pointer-events-none flex flex-col items-center justify-center text-center p-2">
            {hoveredData ? (
              <>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 max-w-[100px] truncate">
                  {hoveredData.label}
                </span>
                <span className="text-sm font-bold font-mono text-slate-100 mt-0.5">
                  {formatVal(hoveredData.value)}
                </span>
                <span className="text-xs font-semibold text-emerald-400 font-mono">
                  {hoveredData.percentage.toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Total
                </span>
                <span className="text-sm font-extrabold font-mono text-emerald-400 mt-0.5">
                  {formatVal(totalValue)}
                </span>
                <span className="text-[10px] font-medium text-indigo-300">Live Metric</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend below chart */}
      <div className="mt-2 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {data.map((item) => {
          const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : '0';
          const isHovered = hoveredData?.label === item.label;

          return (
            <div
              key={item.label}
              className={`flex items-center gap-2 p-1.5 rounded-lg text-xs transition-all ${
                isHovered ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
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
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tooltip.item.color }}></span>
            <span>{tooltip.item.label}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Share:</span>
              <span className="font-bold text-emerald-400">{tooltip.percentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Value:</span>
              <span className="font-semibold font-mono text-indigo-300">{formatVal(tooltip.item.value)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Revenue:</span>
              <span className="text-slate-200 font-mono">{formatCurrency(tooltip.item.revenue)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
