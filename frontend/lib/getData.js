export const fetchDataByDay = async (jwtToken, propertyId, startDate, endDate) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const queryParams = new URLSearchParams({
            propertyId: propertyId,
            startDate: startDate,
            endDate: endDate,
        }).toString();

        const response = await fetch(`${apiUrl}/fetch-data-by-day?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
            },
        });

        if (!response.ok) {
            throw new Error("Data fetch failed");
        }

        const dataByDay = await response.json();
        return dataByDay.data;
    } catch (error) {
        console.error("Error fetching data by day: ", error);
        return null;
    }
}

export const fetchDataByDayFromDetails = async (jwtToken, propertyId, startDate, endDate) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const queryParams = new URLSearchParams({
            propertyId: propertyId,
            startDate: startDate,
            endDate: endDate,
        }).toString();
        
        const response = await fetch(`${apiUrl}/fetch-data-by-day-from-details?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
            },
        });

        if (!response.ok) {
            throw new Error("Data fetch failed");
        }

        const dataByDayFromDetails = await response.json();
        return dataByDayFromDetails.data;
    } catch (error) {
        console.error("Error fetching data by day from details: ", error);
        return null;
    }
}

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

// LLMの解析結果（レポート）を取得
export const fetchLLMReport = async (jwtToken, propertyId, startDate, endDate) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const queryParams = new URLSearchParams({
            propertyId: propertyId,
            startDate: startDate,
            endDate: endDate,
        }).toString();

        const response = await fetch(`${apiUrl}/fetch-llm-report?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
            },
        });

        if (!response.ok) {
            throw new Error("LLM report fetch failed");
        }

        const llmReport = await response.json();
        return llmReport && llmReport.report ? llmReport.report : null;
    } catch (error) {
        console.error("Error fetching LLM report: ", error);
        return null;
    }
}