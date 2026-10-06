import React from 'react';
import './StatusBadge.css';

export default function StatusBadge({ status }) {
  let badgeStyle = 'status-gray';
  const s = String(status || '').toLowerCase();

  if (s.includes('converted') || s.includes('delivered') || s.includes('paid') || s.includes('completed')) {
    badgeStyle = 'status-green';
  } else if (s.includes('estimate') || s.includes('transit') || s.includes('assigned') || s.includes('partially')) {
    badgeStyle = 'status-yellow';
  } else if (s.includes('scheduled') || s.includes('new') || s.includes('ordered') || s.includes('contacted')) {
    badgeStyle = 'status-blue';
  } else if (s.includes('closed') || s.includes('cancelled') || s.includes('unpaid')) {
    badgeStyle = 'status-red';
  }

  return (
    <span className={`status-badge ${badgeStyle}`}>
      <span className="status-badge-dot"></span>
      {status}
    </span>
  );
}
