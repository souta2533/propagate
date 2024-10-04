import { useQuery } from '@tanstack/react-query';
import { fetchAggregatedDataFromDashboard } from '../lib/getData';


// dashboardで使用されるデータを集計
const fetchAggregatedData = async (session, propertyIds, startDate, endDate) => {
    if (
        !session ||
        !propertyIds ||
        !startDate ||
        !endDate
    ) {
        console.warn("Session, propertyIds, startDate, or endDate is null");
        return;
    }

    const jwtToken = session.access_token;
    if (!jwtToken) {
        console.warn("JWT Token is null");
        return;
    }

    const aggregatedDataByPropertyId = {};

      for (const property of propertyIds) {
        const propertyId = property.properties_id;
        try {
          const aggregatedData = await fetchAggregatedDataFromDashboard(
            jwtToken,
            propertyId,
            startDate,
            endDate
          );

          if (aggregatedData) {
            aggregatedDataByPropertyId[propertyId] = aggregatedData;
          }
        } catch (error) {
          console.error("Error fetching aggregated data:", error);
        }
      }
    
    return aggregatedDataByPropertyId;
};

export const useAggregatedData = (session, propertyIds, startDate, endDate) => {
    return useQuery({
        queryKey: ['aggregatedData'],
        queryFn: () => fetchAggregatedData(session, propertyIds, startDate, endDate),
        enabled: !!session && !!propertyIds && propertyIds.length > 1 && !!startDate && !!endDate,
    });
};