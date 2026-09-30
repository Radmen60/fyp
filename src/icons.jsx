// icons.jsx — a small hand-drawn/doodle-style icon set, authored directly
// as inline SVG so there's no dependency on a third-party icon package.
// Every icon uses a sketchy stroke style: rounded caps/joins, visible
// stroke width, and slight off-axis rotation, like a felt-tip marker doodle.

function IconBase({ size = 18, color = 'currentColor', className, rotate = 0, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined, flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

export function DashboardIcon(props) {
  return (
    <IconBase {...props} rotate={-2}>
      <rect x="3.5" y="3.5" width="7.5" height="7" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.5" />
      <rect x="13" y="10.5" width="7.5" height="10" rx="1.5" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
    </IconBase>
  );
}

export function BoxIcon(props) {
  return (
    <IconBase {...props} rotate={-1.5}>
      <path d="M3.5 8.2 12 4l8.5 4.2v8.6L12 21 3.5 16.8z" />
      <path d="M3.5 8.2 12 12.3l8.5-4.1" />
      <path d="M12 12.3V21" />
    </IconBase>
  );
}

export function Box2Icon(props) {
  return (
    <IconBase {...props} rotate={1.5}>
      <path d="M3.5 9.5 11.5 6l8 3.5v7.7L11.5 21l-8-3.8z" />
      <path d="M3.5 9.5 11.5 13l8-3.5" />
      <path d="M11.5 13v8" />
      <path d="M17.5 3.5v5M15 6h5" />
    </IconBase>
  );
}

export function TargetIcon(props) {
  return (
    <IconBase {...props} rotate={-2}>
      <circle cx="12" cy="12" r="8.3" />
      <circle cx="12" cy="12" r="4.8" />
      <circle cx="12.3" cy="11.7" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function UserIcon(props) {
  return (
    <IconBase {...props} rotate={1}>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20c1-4 4-6 7.5-6s6.5 2 7.5 6" />
    </IconBase>
  );
}

export function UserAddIcon(props) {
  return (
    <IconBase {...props} rotate={-1}>
      <circle cx="10" cy="8" r="3.6" />
      <path d="M3.5 20c0.9-3.8 3.6-5.8 6.5-5.8s5.6 2 6.5 5.8" />
      <path d="M18 8v5.5M15.3 10.8h5.4" />
    </IconBase>
  );
}

export function AnalyticsIcon(props) {
  return (
    <IconBase {...props} rotate={-1}>
      <path d="M4 20V9.5" />
      <path d="M10.5 20V4" />
      <path d="M17 20v-7.5" />
      <path d="M3 20.3h18" />
    </IconBase>
  );
}

export function LoginIcon(props) {
  return (
    <IconBase {...props} rotate={1}>
      <path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6" />
      <path d="M10 12h11" />
      <path d="M17.5 8 21 12l-3.5 4" />
    </IconBase>
  );
}

export function LogoutIcon(props) {
  return (
    <IconBase {...props} rotate={-1}>
      <path d="M12 4h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
      <path d="M14 12H3" />
      <path d="M6.5 8 3 12l3.5 4" />
    </IconBase>
  );
}

export function MailIcon(props) {
  return (
    <IconBase {...props} rotate={1}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.5 6.5 12 13 20.5 6.5" />
    </IconBase>
  );
}

export function LockIcon(props) {
  return (
    <IconBase {...props} rotate={-1.5}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M7.5 10.5V7.8a4.5 4.5 0 0 1 9 0v2.7" />
      <circle cx="12" cy="15.3" r="1.3" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function RecycleIcon(props) {
  return (
    <IconBase {...props} rotate={-2}>
      <path d="M9.5 3.5 6 9.8l2.7 1.6" />
      <path d="M6 9.8 3.3 8.2" />
      <path d="M14.7 4.3l4.3 2.2-1.3 3" />
      <path d="M19 6.5l2.9-.5" />
      <path d="M8.6 20.3H4.8L7 16.8" />
      <path d="M8.6 20.3l2-3.1" />
      <path d="M15.4 20.3h3.9l1.6-2.8" />
      <path d="M15.4 20.3l-2-3.4" />
    </IconBase>
  );
}

export function SearchIcon(props) {
  return (
    <IconBase {...props} rotate={2}>
      <circle cx="10.5" cy="10.5" r="6.3" />
      <path d="M15.2 15.4 20.5 20.5" />
    </IconBase>
  );
}

export function TickIcon(props) {
  return (
    <IconBase {...props} rotate={-2}>
      <path d="M4 12.8 9 18 20.5 5.5" />
    </IconBase>
  );
}

export function CrossIcon(props) {
  return (
    <IconBase {...props} rotate={2}>
      <path d="M5.5 5.5 18.5 18.5" />
      <path d="M18.5 5.5 5.5 18.5" />
    </IconBase>
  );
}

export function LocationPinIcon(props) {
  return (
    <IconBase {...props} rotate={0}>
      <path d="M12 21s-7-6.6-7-11.8A7 7 0 0 1 19 9.2C19 14.4 12 21 12 21z" />
      <circle cx="12" cy="9.2" r="2.4" />
    </IconBase>
  );
}

export function WalletIcon(props) {
  return (
    <IconBase {...props} rotate={-1.5}>
      <path d="M3.5 7.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z" />
      <path d="M3.5 10.5H20" />
      <path d="M16 15.2h2.2" />
    </IconBase>
  );
}

export function PhoneIcon(props) {
  return (
    <IconBase {...props} rotate={-1}>
      <path d="M6 3.5c1 0 1.7.3 2 1.2l1 2.6c.3.8 0 1.5-.6 2l-1.2 1c1 2.3 2.6 4 4.9 4.9l1-1.2c.5-.6 1.2-.9 2-.6l2.6 1c.9.3 1.2 1 1.2 2v2c0 1.3-1 2.1-2.3 2C9.9 18.2 5.8 14.1 4.7 7.8 4.5 6.5 5.2 3.5 6 3.5z" />
    </IconBase>
  );
}

export function GavelIcon(props) {
  return (
    <IconBase {...props} rotate={-3}>
      <path d="M13 3.5 20.5 11" />
      <path d="M15.2 5.7 10.4 10.5" />
      <path d="M17.8 8.3 13 13.1" />
      <path d="M10.5 10.4 3.8 17.1a1.6 1.6 0 0 0 2.3 2.3l6.7-6.7" />
      <path d="M4 20.5h9.5" />
    </IconBase>
  );
}

export function ClockIcon(props) {
  return (
    <IconBase {...props} rotate={-2}>
      <circle cx="12" cy="12" r="8.3" />
      <path d="M12 7.5v5l3.6 2" />
    </IconBase>
  );
}

export function ReceiptIcon(props) {
  return (
    <IconBase {...props} rotate={1.5}>
      <path d="M6 3.5h12v17l-2.2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 20.5z" />
      <path d="M8.3 8h7.4M8.3 11.3h7.4M8.3 14.6h4.6" />
    </IconBase>
  );
}

export function HandTruckIcon(props) {
  return (
    <IconBase {...props} rotate={1}>
      <path d="M3.5 16.5V6h9v10.5" />
      <path d="M12.5 10h4.3l3.2 3.5v3h-2" />
      <circle cx="8" cy="18.3" r="1.9" />
      <circle cx="17" cy="18.3" r="1.9" />
      <path d="M3.5 16.5H6M10 16.5h5" />
    </IconBase>
  );
}
