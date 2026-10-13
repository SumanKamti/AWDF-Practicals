import "./LoadingFallback.css";

function LoadingFallback({ message = "Loading content..." }) {
  return (
    <div className="luxury-loading-container" role="status" aria-live="polite">
      <div className="luxury-loading-card">
        <div className="luxury-spinner-glow">
          <div className="luxury-spinner-ring"></div>
          <div className="luxury-spinner-core"></div>
        </div>
        <p className="luxury-loading-text">{message}</p>
        <span className="luxury-loading-subtext">Optimized with React Suspense</span>
      </div>
    </div>
  );
}

export default LoadingFallback;
