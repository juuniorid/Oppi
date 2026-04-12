import clsx from 'clsx';

type SectionTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <h2
      className={clsx('text-base md:text-lg font-semibold text-ink', className)}
    >
      {children}
    </h2>
  );
}
