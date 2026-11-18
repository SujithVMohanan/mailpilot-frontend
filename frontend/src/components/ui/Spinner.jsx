/**
 * Spinner — centered loading indicator.
 *
 * Usage:
 *   <Spinner />
 *   <Spinner size="sm" />    // 16px
 *   <Spinner size="lg" />    // 48px
 */

export default function Spinner({ size = "md" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-blue-500 border-t-transparent`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
