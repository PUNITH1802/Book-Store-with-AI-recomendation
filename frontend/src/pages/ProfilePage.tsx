import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Settings } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export function ProfilePage() {
  const { user, setAuth, accessToken } = useAuthStore();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '' },
  });

  const updateProfile = useMutation({
    mutationFn: (data: { name: string }) => api.patch('/users/profile', data).then((r) => r.data.data),
    onSuccess: (updatedUser) => {
      setAuth(updatedUser, accessToken!);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Settings className="w-6 h-6 text-brand-500" /> Profile Settings
      </h1>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-surface-border">
          <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-2xl font-bold">
            {user?.name[0]}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user?.name}</h3>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-brand-600/20 text-brand-400 mt-1 inline-block">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit((data) => updateProfile.mutate(data))} className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
            <input {...register('name')} className="input" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input value={user?.email} disabled className="input opacity-50 cursor-not-allowed" />
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={isSubmitting || updateProfile.isPending} className="btn-primary px-6 py-2.5">
            {isSubmitting || updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
