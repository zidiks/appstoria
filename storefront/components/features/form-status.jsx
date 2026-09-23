import React from 'react';

export default function FormStatus({ type = 'info', message, reserveSpace = true }) {
  return (
    <div className={reserveSpace ? 'form-status-slot' : undefined}>
      {message ? (
        <p
          className={`form-status form-status--${type}`}
          role={type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
