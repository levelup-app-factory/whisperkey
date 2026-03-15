import React from "react";

const WhisperKeyIcon = ({
  width,
  height,
  className,
}: {
  width?: number | string;
  height?: number | string;
  className?: string;
}) => (
  <svg
    width={width || 24}
    height={height || 24}
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Waveform bars representing voice/audio */}
    <line x1="4" y1="8" x2="4" y2="16" />
    <line x1="8" y1="5" x2="8" y2="19" />
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="16" y1="5" x2="16" y2="19" />
    <line x1="20" y1="8" x2="20" y2="16" />
  </svg>
);

export default WhisperKeyIcon;
