import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';


const fetchAnalyticsData = async (session) => {
    if (!session) {
      console.log("Session is null");
      return;
    }

    const sessionData = session;

    if (!sessionData) {
      // router.push('/auth/login');
    } else {
    //   setSession(sessionData);
    }

    // 1. Userのemailを取得
    //   console.log("Session of this: ", sessionData);
    console.log("User's auth.uin(): ", sessionData.user.id);

    // const email_customer = sessionData.user.user_metadata.email;

    // 2. CustomerDetailsTableからaccountIdを取得
    const { data: customerDetailsData, error: customerDetailsError } =
      await supabase.from("CustomerDetailsTable").select("accounts_id");
    //   .eq("email_customer", email_customer);

    console.log("CustomerDetailsData: ", customerDetailsData);
    if (customerDetailsError) {
      console.error("Error fetching accountIds:", customerDetailsError);
      return;
    }

    const accountIds = customerDetailsData.map((item) => item.accounts_id);
    // setAccountIds(accountIds); // ['1', '2']
    console.log("AccountIds: ", accountIds);

    // 3. PropertyTableからpropertyIdを取得
    const { data: allProperties, error: propertyError } = await supabase
      .from("PropertyTable")
      .select("properties_id, properties_name, account_id, url")
      .in("account_id", accountIds);

    if (propertyError) {
      console.error("Error fetching property ids:", propertyError);
      return;
    }
    console.log("PropertyIds: ", allProperties); // デバッグ用

    // 最初のaccountIdに紐づくpropertyIdを取得
    if (accountIds.length > 0) {
      const initialFilteredProperties = allProperties.filter(
        (p) => p.account_id === accountIds[0]
      );
    }

    // 4. GoogleAnalyticsDataのデータを取得
    const propertyIds = allProperties.map((p) => p.properties_id);
    const { data: allAnalytics, error: analyticsError } = await supabase
      .from("AnalyticsData")
      .select("*")
      .in("property_id", propertyIds);

    if (analyticsError) {
      console.error("Error fetching analytics data:", analyticsError);
      return;
    }

    // setAnalyticsData(allAnalytics); 
    console.log("Analytics: ", allAnalytics);

    return { allAnalytics, allProperties};
  };

  export const useAnalyticsData = (session, setPropertyIds) => {
    return useQuery({
        queryKey: ['analyticsData'],
        queryFn: () => fetchAnalyticsData(session),
        enabled: !!session,
        onSuccess: (data) => {
            setPropertyIds(data.allProperties);
        }
    });
  };