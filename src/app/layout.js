import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"], 
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata = {
  metadataBase: new URL('https://hashim-dev.vercel.app'),
  title: { default: 'Syed Hashim | Software, Mobile & AI Engineer', template: '%s | Syed Hashim' },
  description: 'Software engineer in Karachi building web applications, mobile experiences, AI agent platforms, and cloud-connected systems. Explore projects and experience at Crop2X and NCAI–NED.',
  openGraph: { title: 'Syed Hashim | Software, Mobile & AI Engineer', description: 'Explore web, mobile, agriculture, and AI projects.', url: 'https://hashim-dev.vercel.app', type: 'website', images: [{ url: '/images/hashim-professional.jpg', alt: 'Syed Hashim' }] },
  twitter: { card: 'summary', title: 'Syed Hashim | Software, Mobile & AI Engineer', images: ['/images/hashim-professional.jpg'] },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
