"use client";

import React from "react";

function parseMathContent(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  // support single token base and grouped base in parentheses
  const regex =
    /((?:\([^)]*\)|[A-Za-z0-9]+))(?:\^{([^}]+)}|\^([A-Za-z0-9])|_\{([^}]+)\}|_([A-Za-z0-9]))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    if (start > lastIndex) {
      elements.push(text.slice(lastIndex, start));
    }

    const base = match[1];
    const exponent = match[2] || match[3];
    const subscript = match[4] || match[5];

    elements.push(base);

    if (exponent !== undefined) {
      elements.push(
        <sup key={`sup-${start}`} className="align-super">
          {exponent}
        </sup>,
      );
    } else if (subscript !== undefined) {
      elements.push(
        <sub key={`sub-${start}`} className="align-sub">
          {subscript}
        </sub>,
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
}

interface MathTextProps {
  value?: string | null;
}

export default function MathText({ value }: MathTextProps) {
  if (!value) return null;
  return <>{parseMathContent(value)}</>;
}
