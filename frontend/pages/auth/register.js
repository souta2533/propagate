import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';


const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();

        // SupabaseでUser登録
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess('Registration successful! Please check your email for verification.');
            setEmail('');
            setPassword('');

            // 登録したユーザー情報をバックエンドに送信
            const response = await fetch('/api/register-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email,
              }),
            });

            if (!response.ok) {
              console.error('Failed to register user on the backend');
            }

            // 登録後にダッシュボードへリダイレクト
            router.push('/dashboard');
        }
    }

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {success && <p className="text-green-500 text-center mb-4">{success}</p>}
            <form onSubmit={handleRegister}>
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
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      );
    }

export default Register;