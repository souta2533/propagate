import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';


const fetchSearchConsoleData = async (propertyIds) => {
    try {
      console.log("PropertyIds: ", propertyIds);
      // 全てのPropertyIDからSearch Consoleのデータを取得
      let allSearchConsoleData = {};

      for (const property of propertyIds) {
        const { properties_id } = property;

        const { data, error: searchConsoleError } = await supabase
          .from("SearchConsoleDataTable")
          .select("*")
          .eq("property_id", properties_id)
          .limit(1000);

        if (searchConsoleError) {
          console.error(
            "Error fetching search console data:",
            searchConsoleError
          );
          continue;
        }

        // 取得したデータを辞書形式に追加
        allSearchConsoleData[properties_id] = data;
      }
    //   console.log("Search Console Data: ", allSearchConsoleData);
      return allSearchConsoleData;

    //   setSearchConsoleData(allSearchConsoleData);
    } catch (error) {
      console.error("Error fetching search console data:", error);
    }
  };

  export const useSearchConsoleData = (propertyIds) => {
    return useQuery({
        queryKey: ['searchConsoleData', propertyIds],   // 異なるPropertyIDを使ったクエリは別々にキャッシュされる
        queryFn: () => fetchSearchConsoleData(propertyIds),
        enabled: propertyIds && propertyIds.length > 0,
    });
  };