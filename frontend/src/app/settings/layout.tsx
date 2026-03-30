export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen w-full bg-white">
			<main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
		</div>
	);
}
