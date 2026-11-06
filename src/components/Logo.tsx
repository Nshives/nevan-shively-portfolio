// The eye-in-lens mark. Source files: Claude Work/logo/.
export function Logo({ size = 34 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo-mark-nav.svg" width={size} height={size} alt="" />;
}
