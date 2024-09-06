import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';


export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();     // フォームが送信されたときにページがリロードされるのを防ぐ

        // ログインリクエストをサーバーに送信
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password}),
        });

        const data = await res.json();

        if (res.ok) {
            // session情報をlocalStorageに保存
            localStorage.setItem('supabaseSession', JSON.stringify(data.session));
            
            // ログイン成功時，ダッシュボードへリダイレクト
            await router.push('/dashboard');

            // console.log("Data: ", data);    
        } else {
            // ログイン失敗時，エラーメッセージを表示
            setError(data.message);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
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
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Log In
                    </button>
                </form>
            </div>
        </div>
    );
}