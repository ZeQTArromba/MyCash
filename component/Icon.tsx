import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className, size = 20 }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LucideIcon = (LucideIcons as any)[name];

  if (!LucideIcon) {
    return <LucideIcons.HelpCircle size={size} className={className} />;
  }

  return <LucideIcon size={size} className={className} />;
};
