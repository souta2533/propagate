import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

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

  const email_customer = sessionData.user.user_metadata.email;
  console.log("cosEmail:", email_customer);

  // 2. CustomerDetailsTableからaccountIdを取得
  const { data: customerDetailsData, error: customerDetailsError } =
    await supabase.from("CustomerDetailsTable").select("accounts_id");
  //.eq("email_customer", email_customer);

  const { data: customerAccountIds, error: customerAccountIdsError } =
    await supabase
      .from("CustomerDetailsTable")
      .select("accounts_id")
      .eq("email_customer", email_customer);

  if (customerAccountIdsError) {
    console.error("Error fetching accountIds:", customerAccountIdsError);
    return;
  }

  console.log("CustomerDetailsData: ", customerDetailsData);
  console.log("CustomerAccountIds", customerAccountIds);

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
  let initialFilteredProperties = [];
  if (accountIds.length > 0) {
    initialFilteredProperties = allProperties.filter(
      (p) => p.account_id === customerAccountIds[0].accounts_id
    );
    console.log("InisialProperties:", initialFilteredProperties);
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

  return { allAnalytics, allProperties, initialFilteredProperties };
};

export const useAnalyticsData = (session, setPropertyIds, setUrlOptions) => {
  return useQuery({
    queryKey: ["analyticsData"],
    queryFn: () => fetchAnalyticsData(session),
    enabled: !!session,
    onSuccess: (data) => {
      if (data) {
        setPropertyIds(data.allProperties);
        setUrlOptions(initialFilteredProperties);
      }
    },
  });
};
