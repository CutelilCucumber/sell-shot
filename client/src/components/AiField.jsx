import { useState } from 'react';

function confidenceColor(score) {
  if (!score && score !== 0) return null;
  const clamped = Math.max(0.5, Math.min(1, score));
  const hue = (clamped - 0.5) * 240;
  return {
    border: `hsl(${hue}, 65%, 45%)`,
    bg: `hsla(${hue}, 65%, 45%, 0.06)`,
  };
}

function confidenceLabel(score) {
  if (!score && score !== 0) return null;
  return `${Math.round(score * 100)}% confident`;
}

export default function AiField({
  label,
  name,
  value,
  onChange,
  confidence,
  reasoning,
  type = 'text',
  placeholder,
  children, // for select
  textarea,
  rows,
}) {
  const [focused, setFocused] = useState(false);
  const colors = confidenceColor(confidence);
  const hasAi = confidence !== undefined && confidence !== null;

  const inputStyle = hasAi && colors ? {
    borderColor: colors.border,
    background: colors.bg,
  } : {};

  const sharedProps = {
    className: 'form-input' + (textarea ? ' form-input--textarea' : ''),
    name,
    value,
    onChange,
    placeholder,
    style: inputStyle,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };

  return (
    <div className="ai-field">
      <div className="ai-field__label-row">
        <label className="form-label">{label}</label>
        {hasAi && (
          <span
            className="ai-field__confidence"
            style={{ color: colors?.border }}
          >
            {confidenceLabel(confidence)}
          </span>
        )}
      </div>

      <div className="ai-field__input-wrap">
        {textarea ? (
          <textarea {...sharedProps} rows={rows || 4} />
        ) : children ? (
          <select {...sharedProps}>{children}</select>
        ) : (
          <input {...sharedProps} type={type} />
        )}

        {hasAi && focused && reasoning && (
          <div className="ai-tooltip">
            <span className="ai-tooltip__icon">◈</span>
            <p className="ai-tooltip__text">{reasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
}
