import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TimeSeriesPoint, MetricType } from '../types';
import { formatCurrency, getMetricValue } from '../utils/dataGenerator';

interface D3LineChartProps {
  data: TimeSeriesPoint[];
  metric: MetricType;
  title?: string;
  height?: number;
  showGradient?: boolean;
}

export const D3LineChart: React.FC<D3LineChartProps> = ({
  data,
  metric,
  title = 'Real-Time Sales Trend',
  height = 320,
  showGradient = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    point: TimeSeriesPoint | null;
    visible: boolean;
  }>({ x: 0, y: 0, point: data[0] || null, visible: false });

  const getMetricLabel = (m: MetricType) => {
    switch (m) {
      case 'revenue': return 'Revenue ($)';
      case 'quantity': return 'Units Sold';
      case 'transactionCount': return 'Order Count';
      case 'avgOrderValue': return 'Avg Order Value ($)';
    }
  };

  const formatVal = (val: number, m: MetricType) => {
    if (m === 'revenue' || m === 'avgOrderValue') {
      return formatCurrency(val);
    }
    return val.toLocaleString();
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Gradient definition for Elegant Dark theme
    if (showGradient) {
      const defs = svg.append('defs');
      const gradient = defs
        .append('linearGradient')
        .attr('id', 'line-area-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#6366f1')
        .attr('stop-opacity', 0.45);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#6366f1')
        .attr('stop-opacity', 0.0);
    }

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d: TimeSeriesPoint) => d.timestamp) as [Date, Date])
      .range([0, innerWidth]);

    const yMax = d3.max(data, (d: TimeSeriesPoint) => getMetricValue(d, metric)) || 100;
    const yScale = d3
      .scaleLinear()
      .domain([0, yMax * 1.15])
      .nice()
      .range([innerHeight, 0]);

    // Grid lines for dark background
    const yGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3,3');
    g.selectAll('.grid .domain').remove();

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(data.length, 6))
      .tickFormat((d) => d3.timeFormat('%H:%M:%S')(d as Date));

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => {
        const val = Number(d);
        if (metric === 'revenue' || metric === 'avgOrderValue') {
          return val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`;
        }
        return val.toLocaleString();
      });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px');

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px');

    g.selectAll('.domain').attr('stroke', '#334155');
    g.selectAll('.tick line').attr('stroke', '#334155');

    // Area path
    if (showGradient) {
      const area = d3
        .area<TimeSeriesPoint>()
        .x((d: TimeSeriesPoint) => xScale(d.timestamp))
        .y0(innerHeight)
        .y1((d: TimeSeriesPoint) => yScale(getMetricValue(d, metric)))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'url(#line-area-gradient)')
        .attr('d', area);
    }

    // Line generator
    const line = d3
      .line<TimeSeriesPoint>()
      .x((d: TimeSeriesPoint) => xScale(d.timestamp))
      .y((d: TimeSeriesPoint) => yScale(getMetricValue(d, metric)))
      .curve(d3.curveMonotoneX);

    // Draw main glowing indigo path
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#818cf8')
      .attr('stroke-width', 2.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line);

    // Data Points
    g.selectAll('.data-point')
      .data<TimeSeriesPoint>(data)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', (d: TimeSeriesPoint) => xScale(d.timestamp))
      .attr('cy', (d: TimeSeriesPoint) => yScale(getMetricValue(d, metric)))
      .attr('r', 3.5)
      .attr('fill', '#6366f1')
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2);

    // Overlay for hover tracking
    const focus = g.append('g').style('display', 'none');

    focus
      .append('line')
      .attr('class', 'focus-line-x')
      .attr('stroke', '#475569')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('y1', 0)
      .attr('y2', innerHeight);

    focus
      .append('circle')
      .attr('r', 6)
      .attr('fill', '#818cf8')
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2.5);

    const overlay = g
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all');

    const bisectDate = d3.bisector<TimeSeriesPoint, Date>((d) => d.timestamp).left;

    overlay
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => {
        focus.style('display', 'none');
        setTooltip((prev) => ({ ...prev, visible: false }));
      })
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event);
        const x0 = xScale.invert(mouseX);
        const i = bisectDate(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        let d = d0;
        if (d1 && d0) {
          d = x0.getTime() - d0.timestamp.getTime() > d1.timestamp.getTime() - x0.getTime() ? d1 : d0;
        }

        if (d) {
          const x = xScale(d.timestamp);
          const y = yScale(getMetricValue(d, metric));

          focus.attr('transform', `translate(${x},${y})`);
          focus.select('.focus-line-x').attr('y1', -y).attr('y2', innerHeight - y);

          setTooltip({
            x: x + margin.left,
            y: y + margin.top,
            point: d,
            visible: true,
          });
        }
      });
  }, [data, metric, height, showGradient]);

  return (
    <div className="relative w-full bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-xl shadow-slate-950/40" ref={containerRef}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400">Live stream metrics over time</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {getMetricLabel(metric)}
          </span>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <svg ref={svgRef} className="w-full h-auto overflow-visible"></svg>
      </div>

      {/* D3 Dark Tooltip */}
      {tooltip.visible && tooltip.point && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-slate-950 text-slate-100 p-2.5 rounded-xl shadow-2xl text-xs border border-slate-800 min-w-[140px]"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <div className="font-semibold text-slate-300 border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between">
            <span>{tooltip.point.timeLabel}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Value:</span>
              <span className="font-bold font-mono text-indigo-300">
                {formatVal(getMetricValue(tooltip.point, metric), metric)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Revenue:</span>
              <span className="font-medium font-mono text-emerald-400">{formatCurrency(tooltip.point.revenue)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Orders:</span>
              <span className="font-medium text-slate-200">{tooltip.point.orderCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
