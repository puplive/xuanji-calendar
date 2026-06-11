import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="antialiased bg-black min-h-screen">
        {children}
      </body>
    </html>
  );
}
