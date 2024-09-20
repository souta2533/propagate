export const fetchAggregatedDataFromDashboard = async (jwtToken, propertyId, startDate, endDate) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const queryParams = new URLSearchParams({
            propertyId: propertyId,
            startDate: startDate,
            endDate: endDate,
        }).toString();

        const response = await fetch(`${apiUrl}/fetch-aggregated-data-from-dashboard?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
            },
        });

        if (!response.ok) {
            throw new Error("Aggregated data fetch failed");
        }

        const aggregatedData = await response.json();
        return aggregatedData.data;
    } catch (error) {
        console.error("Error fetching aggregated data: ", error);
        return null;
    }
}

export const fetchAggregatedDataFromDetail = async (jwtToken, propertyId, startDate, endDate) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const queryParams = new URLSearchParams({
            propertyId: propertyId,
            startDate: startDate,
            endDate: endDate,
        }).toString();
        
        const response = await fetch(`${apiUrl}/fetch-aggregated-data-from-detail?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
            },
        });

        if (!response.ok) {
            throw new Error("Aggregated data fetch failed");
        }

        const agregatedData = await response.json();
        return agregatedData.data;
    } catch (error) {
        console.error("Error fetching aggregated data: ", error);
        return null;
    }
}