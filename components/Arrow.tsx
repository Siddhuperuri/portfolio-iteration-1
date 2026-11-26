export function Arrow({ size = 20, back = false }: { size?: number; back?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
      style={back ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M3 12h17M13 5l7 7-7 7" />
    </svg>
  )
}
