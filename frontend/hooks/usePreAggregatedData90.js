import { useQuery } from "@tanstack/react-query";
import { fetchAggregatedDataFromDashboard } from "../lib/getData";

// dashboardで使用されるデータを集計
const fetchPreAggregatedData90 = async (
  session,
  propertyIds,
  preStartDate90,
  preEndDate90
) => {
  if (!session || !propertyIds || !preStartDate90 || !preEndDate90) {
    console.warn("Session, propertyIds, startDate90, or endDate is null");
    return;
  }
  console.log("PSS90:", preStartDate90);
  const jwtToken = session.access_token;
  if (!jwtToken) {
    console.warn("JWT Token is null");
    return;
  }

  const preAggregatedDataByPropertyId90 = {};

  for (const property of propertyIds) {
    const propertyId = property.properties_id;
    try {
      const preAggregatedData90 = await fetchAggregatedDataFromDashboard(
        jwtToken,
        propertyId,
        preStartDate90,
        preEndDate90
      );

      if (preAggregatedData90) {
        preAggregatedDataByPropertyId90[propertyId] = preAggregatedData90;
      }
    } catch (error) {
      console.error("Error fetching aggregated data:", error);
    }
  }

  return preAggregatedDataByPropertyId90;
};

export const usePreAggregatedData90 = (
  session,
  propertyIds,
  preStartDate90,
  preEndDate90
) => {
  return useQuery({
    queryKey: ["preAggregatedData90"],
    queryFn: () =>
      fetchPreAggregatedData90(
        session,
        propertyIds,
        preStartDate90,
        preEndDate90
      ),
    enabled:
      !!session &&
      !!propertyIds &&
      propertyIds.length > 1 &&
      !!preStartDate90 &&
      !!preEndDate90,
  });
};
