import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MetricType } from '../types';
import { formatCurrency } from '../utils/dataGenerator';

export interface BarDataItem {
  label: string;
  value: number;
  revenue: number;
  quantity: number;
  orderCount: number;
  color: string;
}

interface D3BarChartProps {
  data: BarDataItem[];
  metric: MetricType;
  title?: string;
  height?: number;
  horizontal?: boolean;
}

export const D3BarChart: React.FC<D3BarChartProps> = ({
  data,
  metric,
  title = 'Category & Regional Performance',
  height = 320,
  horizontal = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isHorizontal, setIsHorizontal] = useState(horizontal);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    item: BarDataItem | null;
    visible: boolean;
  }>({ x: 0, y: 0, item: null, visible: false });

  const formatVal = (val: number) => {
    if (metric === 'revenue' || metric === 'avgOrderValue') {
      return formatCurrency(val);
    }
    return val.toLocaleString();
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const margin = isHorizontal
      ? { top: 20, right: 40, bottom: 30, left: 120 }
      : { top: 20, right: 20, bottom: 60, left: 60 };

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

    const maxVal = d3.max(data, (d: BarDataItem) => d.value) || 10;

    if (isHorizontal) {
      // Horizontal Bar Chart
      const yScale = d3
        .scaleBand()
        .domain(data.map((d) => d.label))
        .range([0, innerHeight])
        .padding(0.25);

      const xScale = d3
        .scaleLinear()
        .domain([0, maxVal * 1.15])
        .nice()
        .range([0, innerWidth]);

      // Grid lines
      const xGrid = d3.axisBottom(xScale).tickSize(innerHeight).tickFormat(() => '');
      g.append('g')
        .attr('class', 'grid')
        .call(xGrid)
        .selectAll('line')
        .attr('stroke', '#1e293b')
        .attr('stroke-dasharray', '3,3');
      g.selectAll('.grid .domain').remove();

      // Axes
      const yAxis = d3.axisLeft(yScale);
      const xAxis = d3
        .axisBottom(xScale)
        .ticks(5)
        .tickFormat((d) => {
          const val = Number(d);
          if (metric === 'revenue' || metric === 'avgOrderValue') {
            return val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`;
          }
          return val.toString();
        });

      g.append('g')
        .call(yAxis)
        .selectAll('text')
        .attr('fill', '#cbd5e1')
        .attr('font-size', '11px')
        .attr('font-weight', '500');

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('text')
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px');

      g.selectAll('.domain').attr('stroke', '#334155');
      g.selectAll('.tick line').attr('stroke', '#334155');

      // Bars
      const bars = g
        .selectAll('.bar')
        .data<BarDataItem>(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', (d: BarDataItem) => yScale(d.label) || 0)
        .attr('height', yScale.bandwidth())
        .attr('x', 0)
        .attr('width', 0)
        .attr('rx', 4)
        .attr('fill', (d: BarDataItem) => d.color)
        .attr('cursor', 'pointer');

      bars
        .transition()
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr('width', (d: BarDataItem) => xScale(d.value));

      // Value labels
      g.selectAll('.value-label')
        .data<BarDataItem>(data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('y', (d: BarDataItem) => (yScale(d.label) || 0) + yScale.bandwidth() / 2 + 4)
        .attr('x', (d: BarDataItem) => xScale(d.value) + 6)
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text((d: BarDataItem) => formatVal(d.value));

      // Event handlers for tooltips
      bars
        .on('mouseover', function (event, d: BarDataItem) {
          d3.select(this).attr('opacity', 0.85);
          const [mx, my] = d3.pointer(event, container);
          setTooltip({
            x: mx,
            y: my - 10,
            item: d,
            visible: true,
          });
        })
        .on('mousemove', function (event, d: BarDataItem) {
          const [mx, my] = d3.pointer(event, container);
          setTooltip({
            x: mx,
            y: my - 10,
            item: d,
            visible: true,
          });
        })
        .on('mouseout', function () {
          d3.select(this).attr('opacity', 1);
          setTooltip((prev) => ({ ...prev, visible: false }));
        });
    } else {
      // Vertical Bar Chart
      const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.label))
        .range([0, innerWidth])
        .padding(0.3);

      const yScale = d3
        .scaleLinear()
        .domain([0, maxVal * 1.15])
        .nice()
        .range([innerHeight, 0]);

      // Grid lines
      const yGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => '');
      g.append('g')
        .attr('class', 'grid')
        .call(yGrid)
        .selectAll('line')
        .attr('stroke', '#1e293b')
        .attr('stroke-dasharray', '3,3');
      g.selectAll('.grid .domain').remove();

      // Axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => {
          const val = Number(d);
          if (metric === 'revenue' || metric === 'avgOrderValue') {
            return val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`;
          }
          return val.toString();
        });

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('text')
        .attr('fill', '#cbd5e1')
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .attr('transform', data.length > 5 ? 'rotate(-25)' : 'none')
        .style('text-anchor', data.length > 5 ? 'end' : 'middle');

      g.append('g')
        .call(yAxis)
        .selectAll('text')
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px');

      g.selectAll('.domain').attr('stroke', '#334155');
      g.selectAll('.tick line').attr('stroke', '#334155');

      // Bars
      const bars = g
        .selectAll('.bar')
        .data<BarDataItem>(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d: BarDataItem) => xScale(d.label) || 0)
        .attr('width', xScale.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('rx', 4)
        .attr('fill', (d: BarDataItem) => d.color)
        .attr('cursor', 'pointer');

      bars
        .transition()
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr('y', (d: BarDataItem) => yScale(d.value))
        .attr('height', (d: BarDataItem) => innerHeight - yScale(d.value));

      // Value labels above bars
      g.selectAll('.value-label')
        .data<BarDataItem>(data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', (d: BarDataItem) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
        .attr('y', (d: BarDataItem) => yScale(d.value) - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#cbd5e1')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text((d: BarDataItem) => formatVal(d.value));

      // Event handlers
      bars
        .on('mouseover', function (event, d: BarDataItem) {
          d3.select(this).attr('opacity', 0.85);
          const [mx, my] = d3.pointer(event, container);
          setTooltip({
            x: mx,
            y: my - 10,
            item: d,
            visible: true,
          });
        })
        .on('mousemove', function (event, d: BarDataItem) {
          const [mx, my] = d3.pointer(event, container);
          setTooltip({
            x: mx,
            y: my - 10,
            item: d,
            visible: true,
          });
        })
        .on('mouseout', function () {
          d3.select(this).attr('opacity', 1);
          setTooltip((prev) => ({ ...prev, visible: false }));
        });
    }
  }, [data, metric, height, isHorizontal]);

  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="relative w-full bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-xl shadow-slate-950/40" ref={containerRef}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400">Comparing revenue & volumes by segment</p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setIsHorizontal(false)}
            className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${
              !isHorizontal ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vertical
          </button>
          <button
            onClick={() => setIsHorizontal(true)}
            className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${
              isHorizontal ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Horizontal
          </button>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <svg ref={svgRef} className="w-full h-auto overflow-visible"></svg>
      </div>

      {/* Dark Tooltip */}
      {tooltip.visible && tooltip.item && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-slate-950 text-slate-100 p-2.5 rounded-xl shadow-2xl text-xs border border-slate-800 min-w-[150px]"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <div className="flex items-center gap-2 font-semibold border-b border-slate-800 pb-1 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: tooltip.item.color }}></span>
            <span>{tooltip.item.label}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Value:</span>
              <span className="font-bold font-mono text-indigo-300">{formatVal(tooltip.item.value)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Share:</span>
              <span className="font-semibold text-emerald-400">
                {totalValue > 0 ? ((tooltip.item.value / totalValue) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Revenue:</span>
              <span className="text-slate-200 font-mono">{formatCurrency(tooltip.item.revenue)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Orders:</span>
              <span className="text-slate-200">{tooltip.item.orderCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
