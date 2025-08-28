const StarRating = ({ score }) => {
  const fullStars = Math.floor(score * 5);        // Whole stars
  const hasHalf = (score * 5) % 1 >= 0.5;          // Half star condition
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex gap-0.5 text-yellow-500">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="20" height="20" viewBox="0 0 24 24">
          <path d="M12 .587l3.668 7.568L24 9.75l-6 5.845L19.335 24 12 19.897 4.665 24 6 15.595 0 9.75l8.332-1.595z" />
        </svg>
      ))}

      {hasHalf && (
        <svg key="half" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="white" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            fill="url(#half)"
            stroke="currentColor"
            d="M12 .587l3.668 7.568L24 9.75l-6 5.845L19.335 24 12 19.897 4.665 24 6 15.595 0 9.75l8.332-1.595z"
          />
        </svg>
      )}

      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" width="20" height="20" viewBox="0 0 24 24">
          <path d="M12 .587l3.668 7.568L24 9.75l-6 5.845L19.335 24 12 19.897 4.665 24 6 15.595 0 9.75l8.332-1.595z" />
        </svg>
      ))}
    </div>
  );
};

export default StarRating;
