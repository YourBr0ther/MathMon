import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, ArrowLeft, Star, Heart, Loader2, Check } from 'lucide-react';
import { Button } from '../common/Button';

interface SignUpScreenProps {
  onSignUp: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  onSwitchToLogin: () => void;
  onPlayOffline: () => void;
}

export function SignUpScreen({
  onSignUp,
  onSwitchToLogin,
  onPlayOffline,
}: SignUpScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const passwordLongEnough = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordLongEnough) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await onSignUp(email, password);

    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center page-container">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="game-card p-6 sm:p-8 w-full max-w-sm text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 bg-[#8DD99B] rounded-full flex items-center justify-center"
          >
            <Check className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#5D4E60] mb-2">
            Account Created!
          </h2>

          <p className="text-[#8B7A9E] text-sm mb-6">
            Check your email to confirm your account, then sign in to start your adventure!
          </p>

          <Button onClick={onSwitchToLogin} fullWidth>
            Go to Login
          </Button>
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
          className="mt-2"
        >
          <Heart className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-[#FFADC6] fill-[#FFADC6]" />
        </motion.div>
      </motion.div>

      {/* Sign Up Form */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="game-card p-5 sm:p-8 w-full max-w-sm"
      >
        <button
          onClick={onSwitchToLogin}
          className="flex items-center gap-2 text-[#8B7A9E] hover:text-[#5D4E60] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </button>

        <h2 className="font-display text-xl sm:text-2xl font-bold text-[#5D4E60] mb-2 text-center">
          Create Account
        </h2>

        <p className="text-[#8B7A9E] text-sm text-center mb-4">
          Start your Pokemon math adventure!
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
                className="input-kawaii w-full pl-10"
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
                placeholder="At least 6 characters"
                className="input-kawaii w-full pl-10"
                disabled={loading}
                required
                minLength={6}
              />
            </div>
            {password && (
              <p className={`text-xs mt-1 ${passwordLongEnough ? 'text-[#8DD99B]' : 'text-[#8B7A9E]'}`}>
                {passwordLongEnough ? '✓ Password is strong enough' : 'Needs at least 6 characters'}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-[#5D4E60] text-sm font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7A9E]" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type password again"
                className="input-kawaii w-full pl-10"
                disabled={loading}
                required
              />
            </div>
            {confirmPassword && (
              <p className={`text-xs mt-1 ${passwordsMatch ? 'text-[#8DD99B]' : 'text-red-400'}`}>
                {passwordsMatch ? '✓ Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={loading || !passwordsMatch || !passwordLongEnough}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                Create Account
              </span>
            )}
          </Button>
        </form>

        <div className="mt-4">
          <button
            onClick={onPlayOffline}
            className="w-full text-sm text-[#8B7A9E] hover:text-[#5D4E60] py-2 transition-colors"
          >
            Play offline (no account)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
