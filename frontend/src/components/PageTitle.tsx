import clsx from 'clsx';

type PageTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1
      className={clsx(
        'text-xl md:text-3xl font-bold text-ink ml-2 mb-4 md:mb-6',
        className
      )}
    >
      {children}
    </h1>
  );
}
