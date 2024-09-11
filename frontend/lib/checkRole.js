import { supabase } from './supabaseClient';


export const checkUserRole = async () => {
    try {
        // 現在ログイン中のUserを取得
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            throw new Error('User not authenticated');
        }

        // Roles Tableからユーザの役割を取得
        const { data: roleData, error: roleError } = await supabase
            .from('Roles')
            .select('role')
            .eq('id', user.id)
            .single();

        // Roles Tableにデータがない場合，管理者でないと判断
        if (roleError || !roleData) {
            console.log('Role not found');
            return 'user';
        } 

        // Userの役割を返す
        return roleData.role;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
};