import clsx from 'clsx';

type PageTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1
      className={clsx(
        'text-xl md:text-3xl font-bold text-gray-900 ml-2 mb-6',
        className
      )}
    >
      {children}
    </h1>
  );
}
