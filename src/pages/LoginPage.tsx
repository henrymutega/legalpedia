// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { supabase } from '@/integrations/supabase/client';
// import { lovable } from '@/integrations/lovable/index';
// import Layout from '@/components/Layout';
// import { LogIn, Mail } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';

// const LoginPage = () => {
//   const { t } = useTranslation();
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleEmailAuth = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     if (isLogin) {
//       const { error } = await supabase.auth.signInWithPassword({ email, password });
//       if (error) {
//         setError(error.message);
//         setLoading(false);
//         return;
//       }
//       navigate('/');
//     } else {
//       const { error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: { emailRedirectTo: window.location.origin },
//       });
//       if (error) {
//         setError(error.message);
//         setLoading(false);
//         return;
//       }
//       toast({
//         title: t('auth.check_email', 'Check your email'),
//         description: t('auth.verify_email', 'We sent you a verification link to confirm your account.'),
//       });
//       setLoading(false);
//       return;
//     }
//     setLoading(false);
//   };

//   const handleGoogleLogin = async () => {
//     setError('');
//     setLoading(true);
//     const result = await lovable.auth.signInWithOAuth('google', {
//       redirect_uri: window.location.origin,
//     });
//     if (result.error) {
//       setError(result.error.message || 'Google login failed');
//       setLoading(false);
//       return;
//     }
//     if (result.redirected) return;
//     navigate('/');
//   };

//   return (
//     <Layout>
//       <div className="min-h-[70vh] flex items-center justify-center bg-background px-4 py-16">
//         <div className="w-full max-w-md bg-card rounded-lg shadow-card p-8">
//           <div className="text-center mb-8">
//             <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
//               <LogIn size={24} className="text-gold" />
//             </div>
//             <h1 className="font-heading text-2xl font-bold text-foreground">
//               {isLogin ? t('auth.login', 'Sign In') : t('auth.signup', 'Create Account')}
//             </h1>
//             <p className="text-muted-foreground text-sm mt-1">
//               {isLogin
//                 ? t('auth.login_subtitle', 'Sign in for a personalized experience')
//                 : t('auth.signup_subtitle', 'Create your LegalPedia account')}
//             </p>
//           </div>

//           {error && (
//             <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
//           )}

//           {/* Google Login */}
//           <button
//             onClick={handleGoogleLogin}
//             disabled={loading}
//             className="w-full flex items-center justify-center gap-3 py-2.5 border border-border rounded-md text-foreground hover:bg-muted transition-colors mb-4 disabled:opacity-50"
//           >
//             <svg className="w-5 h-5" viewBox="0 0 24 24">
//               <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
//               <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//               <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//               <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//             </svg>
//             {t('auth.google_login', 'Continue with Google')}
//           </button>

//           <div className="relative mb-4">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-border" />
//             </div>
//             <div className="relative flex justify-center text-xs uppercase">
//               <span className="bg-card px-2 text-muted-foreground">{t('auth.or', 'or')}</span>
//             </div>
//           </div>

//           {/* Email/Password */}
//           <form onSubmit={handleEmailAuth} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-foreground mb-1">
//                 {t('auth.email', 'Email')}
//               </label>
//               <div className="relative">
//                 <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//                 <input
//                   type="email"
//                   required
//                   value={email}
//                   onChange={e => setEmail(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-foreground mb-1">
//                 {t('auth.password', 'Password')}
//               </label>
//               <input
//                 type="password"
//                 required
//                 minLength={6}
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//                 className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-2.5 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark transition-colors disabled:opacity-50"
//             >
//               {loading ? '...' : isLogin ? t('auth.login', 'Sign In') : t('auth.signup', 'Create Account')}
//             </button>
//           </form>

//           <p className="text-center text-sm text-muted-foreground mt-4">
//             {isLogin ? t('auth.no_account', "Don't have an account?") : t('auth.has_account', 'Already have an account?')}{' '}
//             <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-gold hover:underline">
//               {isLogin ? t('auth.signup', 'Create Account') : t('auth.login', 'Sign In')}
//             </button>
//           </p>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default LoginPage;
