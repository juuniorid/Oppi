import clsx from 'clsx';

type SectionTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <h2 className={clsx('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h2>
  );
}
