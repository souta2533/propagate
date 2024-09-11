import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';


export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();     // フォームが送信されたときにページがリロードされるのを防ぐ

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        console.log(data.user.id);

        if (error) {
            setError(error.message);
        } else {
            // 管理者であるかを確認
            const { data: roleData, error: roleError } = await supabase
                .from('Roles')
                .select('role')
                .eq('user_id', data.user.id)
                .single();

            if (roleError || !roleData || roleData.role !== 'admin') {
                setError('管理者としてのアクセス権がありません');
            } else if (roleData.role === 'admin') {
                // 管理者がログインに成功した場合，index.jsへリダイレクト
                await router.push('/');
            } else {
                setError('Invalid credentials');
            }
        }
    };

    return (
        <div className="min-h-screen flex">
          <div className="flex-grow">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold mb-6 text-center">管理者ログイン</h1>
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-gray-700">Password</label>
                  <input
                    type="password"
                    id="password"
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Log In
                </button>
              </form>
            </div>
          </div>
        </div>
      );
}