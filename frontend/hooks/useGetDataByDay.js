import { useQuery } from '@tanstack/react-query';
import { fetchDataByDay } from '../lib/getData';


// 日ごとのデータを取得
const fetchData = async (session, propertyIds, startDate, endDate) => {
    if (!session || !propertyIds) {
        console.warn("Session or propertyIds is null");
        return;
    }

    const jwtToken = session.access_token;
    if (!jwtToken) {
        console.warn("JWT Token is null");
        return;
    }

    const dataByDay = {};

    for (const property of propertyIds) {
        const propertyId = property.properties_id;
        try {
            const data = await fetchDataByDay(
                jwtToken, 
                propertyId,
                startDate,
                endDate
            );

            if (data) {
                dataByDay[propertyId] = data;
            }
        } catch (error) {
            console.error("Error fetching data by day:", error);
        }
    }

    return dataByDay;
};

export const useDataByDay = (session, propertyIds, startDate, endDate) => {
    return useQuery({
        queryKey: ['dataByDay', session, propertyIds, startDate, endDate],  // 各値が変更された時の新しいクエリを作成
        queryFn: () => fetchData(session, propertyIds, startDate, endDate),
        enabled: !!session && !!propertyIds && propertyIds.length > 1 && !!startDate && !!endDate,  // 全ての条件が満たされた時のみクエリを実行
    });
};