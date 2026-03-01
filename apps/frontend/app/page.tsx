const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function HomePage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-24">
      <h1 className="text-4xl font-bold tracking-tight">Hello, World</h1>
      <p className="text-sm text-gray-500">
        Backend API:{' '}
        <a href={apiUrl} className="font-mono underline hover:text-gray-700">
          {apiUrl}
        </a>
      </p>
    </main>
  );
}
