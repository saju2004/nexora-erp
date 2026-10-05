import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const s = String(status).toUpperCase();

  let variant = 'neutral';
  if (['ACTIVE', 'COMPLETED', 'PAID', 'APPROVED', 'DELIVERED', 'PRESENT', 'DONE'].includes(s)) {
    variant = 'success';
  } else if (['PENDING', 'PARTIAL', 'LOW_STOCK', 'IN_PROGRESS', 'LATE', 'PLANNING', 'ON_HOLD', 'REVIEW'].includes(s)) {
    variant = 'warning';
  } else if (['CANCELLED', 'REJECTED', 'OUT_OF_STOCK', 'OVERDUE', 'ABSENT', 'INACTIVE', 'SUSPENDED', 'TERMINATED', 'FAILED'].includes(s)) {
    variant = 'danger';
  } else if (['SHIPPED', 'PROCESSING', 'PROCESSED', 'HALF_DAY', 'TODO'].includes(s)) {
    variant = 'info';
  }

  // Format label nicely: e.g. "LOW_STOCK" -> "Low Stock"
  const formatted = s
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return <span className={`badge badge-${variant}`}>{formatted}</span>;
};

export default StatusBadge;
