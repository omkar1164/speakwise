import type { ButtonHTMLAttributes } from 'react';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function PrimaryButton({
  children,
  className = '',
  disabled = false,
  ...rest
}: PrimaryButtonProps): JSX.Element {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-primary)] shadow-sm transition-all duration-200 hover:bg-[var(--color-primary-hover)] hover:shadow-md disabled:cursor-not-allowed disabled:bg-[var(--color-primary-disabled)] disabled:text-[var(--color-on-primary)]/80 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
