import "./globals.css";

export const metadata = {
  title: "Authent",
  description: "Equipment type and service minutes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
