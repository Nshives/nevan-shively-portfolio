// Stand-in for the real eye-in-lens logo. Replace the SVG when Nevan provides it.
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="#4DA3FF" strokeWidth="2.5" aria-hidden="true">
      <circle cx="24" cy="24" r="21" />
      <circle cx="24" cy="24" r="15.5" strokeWidth="1" opacity=".5" />
      <path d="M9 24c4.3-6.6 9.4-10 15-10s10.7 3.4 15 10c-4.3 6.6-9.4 10-15 10S13.3 30.6 9 24z" />
      <circle cx="24" cy="24" r="5" fill="#4DA3FF" stroke="none" />
    </svg>
  );
}
