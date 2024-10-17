import { useQuery } from "@tanstack/react-query";
import { fetchAggregatedDataFromDashboard } from "../lib/getData";

// dashboardで使用されるデータを集計
const fetchAggregatedData90 = async (
  session,
  propertyIds,
  startDate90,
  endDate
) => {
  if (!session || !propertyIds || !startDate90 || !endDate) {
    console.warn("Session, propertyIds, startDate90, or endDate is null");
    return;
  }
  console.log("SS90:", startDate90);
  const jwtToken = session.access_token;
  if (!jwtToken) {
    console.warn("JWT Token is null");
    return;
  }

  const aggregatedDataByPropertyId90 = {};

  for (const property of propertyIds) {
    const propertyId = property.properties_id;
    try {
      const aggregatedData90 = await fetchAggregatedDataFromDashboard(
        jwtToken,
        propertyId,
        startDate90,
        endDate
      );

      if (aggregatedData90) {
        aggregatedDataByPropertyId90[propertyId] = aggregatedData90;
      }
    } catch (error) {
      console.error("Error fetching aggregated data:", error);
    }
  }

  return aggregatedDataByPropertyId90;
};

export const useAggregatedData90 = (
  session,
  propertyIds,
  startDate90,
  endDate
) => {
  return useQuery({
    queryKey: ["aggregatedData90"],
    queryFn: () =>
      fetchAggregatedData90(session, propertyIds, startDate90, endDate),
    enabled:
      !!session &&
      !!propertyIds &&
      propertyIds.length > 1 &&
      !!startDate90 &&
      !!endDate,
  });
};
