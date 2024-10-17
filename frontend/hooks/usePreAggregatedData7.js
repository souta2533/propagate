import { useQuery } from "@tanstack/react-query";
import { fetchAggregatedDataFromDashboard } from "../lib/getData";

// dashboardで使用されるデータを集計
const fetchPreAggregatedData7 = async (
  session,
  propertyIds,
  preStartDate7,
  preEndDate7
) => {
  if (!session || !propertyIds || !preStartDate7 || !preEndDate7) {
    console.warn("Session, propertyIds, startDate7, or endDate is null");
    return;
  }
  console.log("PSS7:", preStartDate7);
  const jwtToken = session.access_token;
  if (!jwtToken) {
    console.warn("JWT Token is null");
    return;
  }

  const preAggregatedDataByPropertyId7 = {};

  for (const property of propertyIds) {
    const propertyId = property.properties_id;
    try {
      const preAggregatedData7 = await fetchAggregatedDataFromDashboard(
        jwtToken,
        propertyId,
        preStartDate7,
        preEndDate7
      );

      if (preAggregatedData7) {
        preAggregatedDataByPropertyId7[propertyId] = preAggregatedData7;
      }
    } catch (error) {
      console.error("Error fetching aggregated data:", error);
    }
  }

  return preAggregatedDataByPropertyId7;
};

export const usePreAggregatedData7 = (
  session,
  propertyIds,
  preStartDate7,
  preEndDate7
) => {
  return useQuery({
    queryKey: ["preAggregatedData7"],
    queryFn: () =>
      fetchPreAggregatedData7(session, propertyIds, preStartDate7, preEndDate7),
    enabled:
      !!session &&
      !!propertyIds &&
      propertyIds.length > 1 &&
      !!preStartDate7 &&
      !!preEndDate7,
  });
};
