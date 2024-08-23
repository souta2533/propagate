import { supabase } from '../../../lib/supabaseClient';


export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        // SupabaseでUserをサインイン
        const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 認証成功の場合，JWTトークンなどをクライアントに返す
        return res.status(200).json({ message: 'Login successful', data});
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}