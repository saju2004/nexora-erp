import React from 'react';

export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <div style={{ padding: '16px' }}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div
          key={rIdx}
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '14px',
            alignItems: 'center',
          }}
        >
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="skeleton skeleton-text"
              style={{
                width: cIdx === 0 ? '40px' : cIdx === 1 ? '160px' : '100px',
                height: '16px',
                margin: 0,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="stat-card">
      <div className="skeleton skeleton-text" style={{ width: '40%', height: '12px' }} />
      <div className="skeleton skeleton-title" style={{ width: '70%', height: '24px', margin: '12px 0 8px' }} />
      <div className="skeleton skeleton-text" style={{ width: '50%', height: '12px' }} />
    </div>
  );
};
