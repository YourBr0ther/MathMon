import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ArrowLeft, Star, Heart, UserPlus, Loader2, WifiOff } from 'lucide-react';
import { Button } from '../common/Button';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  onSwitchToSignUp: () => void;
  onForgotPassword: (email: string) => Promise<{ error: { message: string } | null }>;
  onPlayOffline: () => void;
}

export function LoginScreen({
  onLogin,
  onSwitchToSignUp,
  onForgotPassword,
  onPlayOffline,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await onLogin(email, password);

    if (result.error) {
      setError(result.error.message);
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError('');

    const result = await onForgotPassword(email);

    if (result.error) {
      setError(result.error.message);
    } else {
      setResetSent(true);
    }

    setLoading(false);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center page-container">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="game-card p-6 sm:p-8 w-full max-w-sm"
        >
          <button
            onClick={() => {
              setShowForgotPassword(false);
              setResetSent(false);
              setError('');
            }}
            className="flex items-center gap-2 text-[#8B7A9E] hover:text-[#5D4E60] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>

          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#5D4E60] mb-2 text-center">
            Reset Password
          </h2>

          {resetSent ? (
            <div className="text-center">
              <p className="text-[#8DD99B] mb-4">
                Check your email for a password reset link!
              </p>
              <Button onClick={() => setShowForgotPassword(false)} fullWidth>
                Back to Login
              </Button>
            </div>
          ) : (
            <>
              <p className="text-[#8B7A9E] text-sm text-center mb-4">
                Enter your email and we'll send you a reset link
              </p>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm text-center mb-4 bg-red-50 p-2 rounded-lg"
                >
                  {error}
                </motion.p>
              )}

              <div className="mb-4">
                <label className="block text-[#5D4E60] text-sm font-medium mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7A9E]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trainer@pokemon.com"
                    className="input-kawaii w-full !pl-12"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button onClick={handleForgotPassword} fullWidth disabled={loading || !email}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center page-container">
      {/* Logo/Title */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4 sm:mb-8"
      >
        <motion.span
          className="star-decoration inline-block mr-2"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Star className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
        </motion.span>

        <h1 className="title-main text-3xl sm:text-5xl mb-0.5 inline">
          MathMon
        </h1>

        <motion.span
          className="star-decoration inline-block ml-2"
          animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        >
          <Star className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
        </motion.span>

        <h2 className="title-sub text-lg sm:text-2xl mt-1">
          Quest
        </h2>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-2 flex justify-center"
        >
          <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFADC6] fill-[#FFADC6]" />
        </motion.div>
      </motion.div>

      {/* Login Form */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="game-card p-5 sm:p-8 w-full max-w-sm"
      >
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[#5D4E60] mb-4 text-center">
          Welcome Back!
        </h2>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm text-center mb-4 bg-red-50 p-2 rounded-lg"
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#5D4E60] text-sm font-medium mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7A9E]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trainer@pokemon.com"
                className="input-kawaii w-full !pl-12"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[#5D4E60] text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7A9E]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your secret password"
                className="input-kawaii w-full !pl-12"
                disabled={loading}
                required
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-[#8EC5FC] hover:text-[#6BA3DA] mb-4 block"
          >
            Forgot password?
          </button>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                Sign In
              </span>
            )}
          </Button>
        </form>

        <div className="!mt-12 !pt-8 border-t border-[#E8DFF0]">
          <div className="!mb-8">
            <Button onClick={onSwitchToSignUp} variant="secondary" fullWidth>
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                Create Account
              </span>
            </Button>
          </div>

          <div>
            <Button onClick={onPlayOffline} variant="mint" fullWidth>
              <span className="flex items-center justify-center gap-2">
                <WifiOff className="w-5 h-5" />
                Play Offline
              </span>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
