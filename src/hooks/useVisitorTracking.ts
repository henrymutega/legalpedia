// import { useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import { supabase } from '@/integrations/supabase/client';

// const getVisitorId = (): string => {
//   let id = localStorage.getItem('visitor_id');
//   if (!id) {
//     id = crypto.randomUUID();
//     localStorage.setItem('visitor_id', id);
//   }
//   return id;
// };

// export const useVisitorTracking = () => {
//   const location = useLocation();

//   useEffect(() => {
//     const visitorId = getVisitorId();
//     const page = location.pathname;

//     const track = async () => {
//       // Try to get existing visitor
//       const { data: existing } = await supabase
//         .from('visitors')
//         .select('id, pages_visited')
//         .eq('visitor_id', visitorId)
//         .maybeSingle();

//       if (existing) {
//         const pages = existing.pages_visited || [];
//         if (!pages.includes(page)) pages.push(page);
//         await supabase
//           .from('visitors')
//           .update({ last_visit: new Date().toISOString(), pages_visited: pages })
//           .eq('id', existing.id);
//       } else {
//         await supabase
//           .from('visitors')
//           .insert({ visitor_id: visitorId, pages_visited: [page] });
//       }
//     };

//     track();
//   }, [location.pathname]);
// };

// export const getStoredVisitorId = () => localStorage.getItem('visitor_id');
