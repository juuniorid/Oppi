import { SectionTitle } from '@/components/SectionTitle';
import clsx from 'clsx';

type BoxProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Box({ title, children, className }: BoxProps) {
  let header = null;

  if (title) {
    header = <SectionTitle className="mb-4">{title}</SectionTitle>;
  }
  return (
    <div className={clsx('rounded-2xl bg-[#faf8f5] border p-4', className)}>
      {header}
      {children}
    </div>
  );
}
