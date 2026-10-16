const STARS = [1, 2, 3, 4, 5];

export function StarRating({ value }) {
  if (value == null) return <span className="not-scored">Not scored</span>;

  return (
    <span className="stars" role="img" aria-label={`${value} out of 5`}>
      {STARS.map((star) => {
        const fill = value >= star ? 'full' : value >= star - 0.5 ? 'half' : 'empty';
        return (
          <span key={star} className={`star star-${fill}`} aria-hidden="true">
            ★
          </span>
        );
      })}
    </span>
  );
}
