export default function LotusIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Center petal */}
      <path d="M32 48 C32 48 22 36 22 24 C22 18 27 14 32 14 C37 14 42 18 42 24 C42 36 32 48 32 48Z" fill="#C49A3C" opacity="0.9"/>
      {/* Left petal */}
      <path d="M32 44 C32 44 16 38 12 26 C10 20 13 15 18 14 C23 13 28 17 30 23 C32 32 32 44 32 44Z" fill="#C49A3C" opacity="0.65"/>
      {/* Right petal */}
      <path d="M32 44 C32 44 48 38 52 26 C54 20 51 15 46 14 C41 13 36 17 34 23 C32 32 32 44 32 44Z" fill="#C49A3C" opacity="0.65"/>
      {/* Far left petal */}
      <path d="M30 42 C30 42 12 40 8 28 C6 21 10 16 15 16 C19 16 23 19 26 25 C29 33 30 42 30 42Z" fill="#C49A3C" opacity="0.4"/>
      {/* Far right petal */}
      <path d="M34 42 C34 42 52 40 56 28 C58 21 54 16 49 16 C45 16 41 19 38 25 C35 33 34 42 34 42Z" fill="#C49A3C" opacity="0.4"/>
      {/* Stem */}
      <path d="M30 50 Q32 54 34 50" stroke="#C49A3C" strokeWidth="1.5" fill="none" opacity="0.7"/>
    </svg>
  )
}
