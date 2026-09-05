export function RoseMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 6c4 0 7 2.7 7 6.4 0 4.5-3.3 7.6-7 10.6-3.7-3-7-6.1-7-10.6C9 8.7 12 6 16 6Z" />
      <path d="M16 9.5c2 0 3.6 1.3 3.6 3.2 0 2.3-1.7 3.9-3.6 5.4-1.9-1.5-3.6-3.1-3.6-5.4 0-1.9 1.6-3.2 3.6-3.2Z" />
      <path d="M16 23.6V28" />
      <path d="M16 25.6c-1.8 0-3.2-1-3.9-2.4 1.9-.4 3.2.5 3.9 1.6" />
    </svg>
  );
}
