import React from "react";

const WhisperKeyTextLogo = ({
  width,
  height,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) => {
  const aspectRatio = 340 / 50;
  const computedWidth = width || (height ? height * aspectRatio : 200);
  const computedHeight = height || (width ? width / aspectRatio : undefined);

  return (
    <svg
      width={computedWidth}
      height={computedHeight}
      className={className}
      viewBox="0 0 340 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="170"
        y="37"
        textAnchor="middle"
        className="fill-text"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="700"
        fontSize="38"
        letterSpacing="-0.5"
      >
        {/* Brand name — not translatable */}
        {"WhisperKey"}
      </text>
    </svg>
  );
};

export default WhisperKeyTextLogo;
