import type { ReactNode, SVGProps } from 'react';

export type IconName =
  | 'alert'
  | 'arrowRight'
  | 'book'
  | 'brain'
  | 'cards'
  | 'check'
  | 'clock'
  | 'copy'
  | 'download'
  | 'file'
  | 'home'
  | 'layers'
  | 'link'
  | 'map'
  | 'math'
  | 'refresh'
  | 'search'
  | 'spark'
  | 'target'
  | 'text'
  | 'upload'
  | 'zap';

const paths: Record<IconName, ReactNode> = {
  alert: (
    <>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" />
      <path d="M8 7h8" />
      <path d="M8 11h6" />
    </>
  ),
  brain: (
    <>
      <path d="M8.5 14.5A3.5 3.5 0 0 1 5 11V8.8A3.8 3.8 0 0 1 8.8 5H9a3 3 0 0 1 6 0h.2A3.8 3.8 0 0 1 19 8.8V11a3.5 3.5 0 0 1-3.5 3.5" />
      <path d="M9 5v14" />
      <path d="M15 5v14" />
      <path d="M8.5 14.5A3.5 3.5 0 0 0 12 18a3.5 3.5 0 0 0 3.5-3.5" />
      <path d="M7 10h4" />
      <path d="M13 10h4" />
    </>
  ),
  cards: (
    <>
      <path d="M8 4h10a2 2 0 0 1 2 2v12" />
      <path d="M6 8h10a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
      <path d="M8 13h6" />
      <path d="M8 16h4" />
    </>
  ),
  check: (
    <>
      <path d="M20 6 9 17l-5-5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  layers: (
    <>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.1a5 5 0 0 0 7.07 7.07L13 19.07" />
    </>
  ),
  map: (
    <>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
      <path d="M9 3v15" />
      <path d="M15 6v15" />
    </>
  ),
  math: (
    <>
      <path d="M4 7h16" />
      <path d="M4 17h16" />
      <path d="M7 12h6" />
      <path d="M10 9v6" />
      <path d="m17 10-4 4" />
      <path d="m13 10 4 4" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 0 1-15.5 6.2" />
      <path d="M3 12A9 9 0 0 1 18.5 5.8" />
      <path d="M18 3v4h-4" />
      <path d="M6 21v-4h4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  spark: (
    <>
      <path d="M12 2 14 8l6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" />
      <path d="M19 15v4" />
      <path d="M21 17h-4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  text: (
    <>
      <path d="M4 6h16" />
      <path d="M8 6v14" />
      <path d="M16 6v14" />
      <path d="M6 20h4" />
      <path d="M14 20h4" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M20 16.5A4.5 4.5 0 0 1 15.5 21h-7A4.5 4.5 0 0 1 4 16.5" />
    </>
  ),
  zap: (
    <>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </>
  ),
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export default function Icon({ name, size = 18, className = '', style, ...props }: IconProps) {
  return (
    <svg
      className={`app-icon ${className}`.trim()}
      width={size}
      height={size}
      style={{ width: size, height: size, flex: '0 0 auto', ...style }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
