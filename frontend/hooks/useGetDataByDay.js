import { useQuery } from '@tanstack/react-query';
import { fetchDataByDay, fetchDataByDayFromDetails } from '../lib/getData';


// 日ごとのデータを取得
const fetchData = async (session, propertyIds, startDate, endDate) => {
    if (!session || !propertyIds || !startDate || !endDate) {
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

// 日ごとのデータを取得（detail用）
const fetchDataFromDetails = async (session, propertyIds, startDate, endDate) => {
    if (!session || !propertyIds || !startDate || !endDate) {
        console.warn("Session or propertyIds is null");
        return;
    }

    const jwtToken = session.access_token;
    if (!jwtToken) {
        console.warn("JWT Token is null");
        return;
    }

    const dataByDayFromDetails = {};

    for (const property of propertyIds) {
        const propertyId = property.properties_id;
        try {
            const data = await fetchDataByDayFromDetails(
                jwtToken,
                propertyId,
                startDate,
                endDate
            );

            if (data) {
                dataByDayFromDetails[propertyId] = data;
            }
        } catch (error) {
            console.error("Error fetching data by day from details:", error);
        }
    } 

    return dataByDayFromDetails;
}

export const useDataByDayFromDetails = (session, propertyIds, startDate, endDate) => {
    return useQuery({
        queryKey: ['dataByDayFromDetails', session, propertyIds, startDate, endDate],
        queryFn: () => fetchDataFromDetails(session, propertyIds, startDate, endDate),
        enabled: !!session && !!propertyIds && propertyIds.length > 1 && !!startDate && !!endDate,
    });
};