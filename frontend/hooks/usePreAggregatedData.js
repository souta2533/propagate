import { useQuery } from "@tanstack/react-query";
import { fetchAggregatedDataFromDashboard } from "../lib/getData";

// dashboardで使用されるデータを集計
const fetchPreAggregatedData = async (
  session,
  propertyIds,
  preStartDate,
  preEndDate
) => {
  if (!session || !propertyIds || !preStartDate || !preEndDate) {
    console.warn("Session, propertyIds, startDate, or endDate is null");
    return;
  }
  console.log("PSS:", preStartDate);
  const jwtToken = session.access_token;
  if (!jwtToken) {
    console.warn("JWT Token is null");
    return;
  }

  const preAggregatedDataByPropertyId = {};

  for (const property of propertyIds) {
    const propertyId = property.properties_id;
    try {
      const preAggregatedData = await fetchAggregatedDataFromDashboard(
        jwtToken,
        propertyId,
        preStartDate,
        preEndDate
      );

      if (preAggregatedData) {
        preAggregatedDataByPropertyId[propertyId] = preAggregatedData;
      }
    } catch (error) {
      console.error("Error fetching aggregated data:", error);
    }
  }

  return preAggregatedDataByPropertyId;
};

export const usePreAggregatedData = (
  session,
  propertyIds,
  preStartDate,
  preEndDate
) => {
  return useQuery({
    queryKey: ["preAggregatedData"],
    queryFn: () =>
      fetchPreAggregatedData(session, propertyIds, preStartDate, preEndDate),
    enabled:
      !!session &&
      !!propertyIds &&
      propertyIds.length > 1 &&
      !!preStartDate &&
      !!preEndDate,
  });
};
