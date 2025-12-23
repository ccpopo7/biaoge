import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (isLogin) {
        // Handle Login
        const storedUsersStr = localStorage.getItem('app_users');
        const users: User[] = storedUsersStr ? JSON.parse(storedUsersStr) : [];
        
        const user = users.find(u => u.username === formData.username && u.password === formData.password);
        
        if (user) {
          localStorage.setItem('app_current_user', JSON.stringify(user));
          onLogin(user);
        } else {
          setError('用户名或密码错误');
        }
      } else {
        // Handle Register
        if (!formData.username || !formData.password || !formData.name) {
          setError('请填写所有必填项');
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('两次输入的密码不一致');
          setLoading(false);
          return;
        }

        const storedUsersStr = localStorage.getItem('app_users');
        const users: User[] = storedUsersStr ? JSON.parse(storedUsersStr) : [];

        if (users.find(u => u.username === formData.username)) {
          setError('该用户名已被注册');
          setLoading(false);
          return;
        }

        const newUser: User = {
          username: formData.username,
          password: formData.password,
          name: formData.name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=0D8ABC&color=fff`
        };

        users.push(newUser);
        localStorage.setItem('app_users', JSON.stringify(users));
        
        // Auto login after register
        localStorage.setItem('app_current_user', JSON.stringify(newUser));
        onLogin(newUser);
      }
    } catch (err) {
      setError('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
         <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-200">
               <span className="text-white font-bold text-xl">L</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isLogin ? '欢迎回来' : '创建账号'}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {isLogin ? '请登录以管理您的直播样品库存' : '注册以开始使用直播选品系统'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">您的昵称</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
                    placeholder="例如: 直播小助理"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名/账号</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
                  placeholder="请输入密码"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
                    placeholder="请再次输入密码"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></div>
                 {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              {loading ? '处理中...' : (isLogin ? '登录系统' : '立即注册')}
              {!loading && <ArrowRight size={16} className="ml-2" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? '还没有账号？' : '已有账号？'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ ...formData, password: '', confirmPassword: '' });
                }}
                className="font-medium text-blue-600 hover:text-blue-500 ml-1 hover:underline transition-all"
              >
                {isLogin ? '去注册' : '去登录'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};