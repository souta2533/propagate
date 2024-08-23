import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
    const router = useRouter();

    useEffect(() => {
        const session = supabase.auth.getSession();
        if (!session) {
            router.push('/auth/login');
        }
    }, []);

    // ダッシュボードの内容を記載
    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    )
}

export default Dashboard;