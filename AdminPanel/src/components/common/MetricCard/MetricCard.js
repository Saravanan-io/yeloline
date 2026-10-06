import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './MetricCard.css';

export default function MetricCard({ title, value, icon: Icon, trend, subtext, highlight }) {
  return (
    <div className="metric-card">
      {highlight && <div className="metric-card-accent-strip" />}
      <div className="metric-card-header">
        <span className="metric-card-title">{title}</span>
        {Icon && (
          <div className="metric-card-icon">
            <Icon size={22} />
          </div>
        )}
      </div>
      <div className="metric-card-value">{value}</div>
      {subtext && (
        <div className="metric-card-footer">
          {trend && (
            <span className={`metric-trend-badge ${trend.startsWith('+') ? 'metric-trend-up' : 'metric-trend-down'}`}>
              {trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trend}
            </span>
          )}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
