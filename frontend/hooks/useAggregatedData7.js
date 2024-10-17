import { useQuery } from "@tanstack/react-query";
import { fetchAggregatedDataFromDashboard } from "../lib/getData";

// dashboardで使用されるデータを集計
const fetchAggregatedData7 = async (
  session,
  propertyIds,
  startDate7,
  endDate
) => {
  if (!session || !propertyIds || !startDate7 || !endDate) {
    console.warn("Session, propertyIds, startDate7, or endDate is null");
    return;
  }
  console.log("SS7:", startDate7);
  const jwtToken = session.access_token;
  if (!jwtToken) {
    console.warn("JWT Token is null");
    return;
  }

  const aggregatedDataByPropertyId7 = {};

  for (const property of propertyIds) {
    const propertyId = property.properties_id;
    try {
      const aggregatedData7 = await fetchAggregatedDataFromDashboard(
        jwtToken,
        propertyId,
        startDate7,
        endDate
      );

      if (aggregatedData7) {
        aggregatedDataByPropertyId7[propertyId] = aggregatedData7;
      }
    } catch (error) {
      console.error("Error fetching aggregated data:", error);
    }
  }

  return aggregatedDataByPropertyId7;
};

export const useAggregatedData7 = (
  session,
  propertyIds,
  startDate7,
  endDate
) => {
  return useQuery({
    queryKey: ["aggregatedData7"],
    queryFn: () =>
      fetchAggregatedData7(session, propertyIds, startDate7, endDate),
    enabled:
      !!session &&
      !!propertyIds &&
      propertyIds.length > 1 &&
      !!startDate7 &&
      !!endDate,
  });
};
