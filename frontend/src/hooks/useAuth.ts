import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { login, logout, isAuthenticated, user, isAdmin } = useAuthStore();

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authApi.getMe();
      return response.data?.user;
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      if (data.data) {
        const { user, tokens } = data.data;
        login(user, tokens.accessToken, tokens.refreshToken);
        toast.success('Registration successful!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.data) {
        const { user, tokens } = data.data;
        login(user, tokens.accessToken, tokens.refreshToken);
        toast.success('Login successful!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: () => {
      logout();
      queryClient.clear();
    },
  });

  return {
    user: currentUser || user,
    isAuthenticated,
    isAdmin,
    isLoading: isLoadingUser,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};
