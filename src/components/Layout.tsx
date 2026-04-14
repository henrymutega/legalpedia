import { type ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
//import Chatbot from './Chatbot';
import ScrollToTopButton from './ScrollToTopButton';
//import { useVisitorTracking } from '@/hooks/useVisitorTracking';
//import { useFacebookPixel } from '@/hooks/useFacebookPixel';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // useVisitorTracking();
  // useFacebookPixel();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20">{children}</main>
      <Footer />
      {/* <Chatbot /> */}
      <ScrollToTopButton />
    </div>
  );
};

export default Layout;
