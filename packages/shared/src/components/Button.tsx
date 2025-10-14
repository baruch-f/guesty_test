// packages/shared/src/components/Button.tsx
import React from 'react';
import clsx from 'clsx';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  leadingIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className,
  leadingIcon
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'btn',
        variant === 'primary' ? 'btn--primary' : 'btn--secondary',
        disabled && 'opacity-60 cursor-not-allowed shadow-none',
        className
      )}
    >
      {leadingIcon ? <span className="text-lg">{leadingIcon}</span> : null}
      <span>{children}</span>
    </button>
  );
};