// import { useEffect } from 'react';
// import { useLocation } from 'react-router-dom';

// // Replace with your actual Facebook Pixel ID
// const FB_PIXEL_ID = 'YOUR_PIXEL_ID_HERE';

// declare global {
//   interface Window {
//     fbq: (...args: any[]) => void;
//     _fbq: (...args: any[]) => void;
//   }
// }

// const initPixel = () => {
//   if (window.fbq) return;

//   const f = window;
//   const n = (f.fbq = function (...args: any[]) {
//     // @ts-ignore
//     n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
//   } as any);
//   if (!f._fbq) f._fbq = n;
//   n.push = n;
//   n.loaded = true;
//   n.version = '2.0';
//   n.queue = [];

//   const script = document.createElement('script');
//   script.async = true;
//   script.src = 'https://connect.facebook.net/en_US/fbevents.js';
//   const firstScript = document.getElementsByTagName('script')[0];
//   firstScript.parentNode?.insertBefore(script, firstScript);

//   window.fbq('init', FB_PIXEL_ID);
//   window.fbq('track', 'PageView');
// };

// export const useFacebookPixel = () => {
//   const location = useLocation();

//   useEffect(() => {
//     if (FB_PIXEL_ID === 'YOUR_PIXEL_ID_HERE') return;
//     initPixel();
//   }, []);

//   useEffect(() => {
//     if (FB_PIXEL_ID === 'YOUR_PIXEL_ID_HERE') return;
//     if (window.fbq) {
//       window.fbq('track', 'PageView');
//     }
//   }, [location.pathname]);
// };

// // Helper to track custom events
// export const trackEvent = (event: string, data?: Record<string, any>) => {
//   if (window.fbq) {
//     window.fbq('track', event, data);
//   }
// };
