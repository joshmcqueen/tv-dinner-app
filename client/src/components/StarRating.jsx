export default function StarRating({ value, onChange, readonly = false, size = 'normal' }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`stars ${readonly ? 'readonly' : ''} ${size === 'small' ? 'small' : ''}`}>
      {stars.map((n) => (
        <span
          key={n}
          className={`star ${value >= n ? 'filled' : ''}`}
          onClick={() => !readonly && onChange && onChange(n)}
          role={readonly ? undefined : 'button'}
          aria-label={readonly ? undefined : `${n} star${n !== 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
