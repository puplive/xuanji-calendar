"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-black text-white p-8 min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Application Error</h1>
          <pre className="text-xs text-zinc-400 bg-zinc-900 p-4 rounded-2xl overflow-auto text-left mb-6">
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
          <button
            onClick={reset}
            className="px-6 py-3 bg-gold-500 text-black rounded-2xl font-bold"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
