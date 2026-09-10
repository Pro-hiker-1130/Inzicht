import './globals.css';

export const metadata = {
  title: 'Inzicht — Therapy Practice',
  description: 'Book a consultation with the practice.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
