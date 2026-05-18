import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const { user, accessToken } = await authService.register({ name: data.name, email: data.email, password: data.password });
      setAuth(user, accessToken);
      toast.success(`Welcome to BookCart, ${user.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface">
      <div className="absolute inset-0 bg-gradient-radial from-brand-900/20 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-sm p-8 relative"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-gradient">
            <BookOpen className="w-6 h-6 text-brand-500" /> BookCart
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-1">Create account</h1>
          <p className="text-sm text-gray-500">Join thousands of readers today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
            <input {...register('name')} className="input" placeholder="Jane Smith" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input {...register('email')} type="email" className="input" placeholder="you@example.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <div className="relative">
              <input {...register('password')} type={showPass ? 'text' : 'password'} className="input pr-10" placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Confirm Password</label>
            <input {...register('confirmPassword')} type="password" className="input" placeholder="••••••••" />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5 mt-2">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
