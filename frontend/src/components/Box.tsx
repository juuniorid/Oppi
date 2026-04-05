import { SectionTitle } from '@/components/SectionTitle';

type BoxProps = {
  title?: string;
  children: React.ReactNode;
};

export function Box({ title, children }: BoxProps) {
  return (
    <div className="rounded-2xl bg-[#faf8f5] border p-4">
      <SectionTitle className="mb-4">{title}</SectionTitle>
      {children}
    </div>
  );
}
