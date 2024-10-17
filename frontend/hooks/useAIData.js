import { useQuery } from "@tanstack/react-query";
import { fetchLLMReport } from "../lib/getData";


// LLMからの解析結果を取得
const fetchLLMReports = async (session, propertyIds, startDate, endDate) => {
    if (!session || !propertyIds || !startDate || !endDate) {
        console.warn("Session or propertyIds is null");
        return;
    }

    const jwtToken = session.access_token;
    if (!jwtToken) {
        console.warn("JWT Token is null");
        return;
    }

    const reportByPropertyId = {};

    for (const property of propertyIds) {
        const propertyId = property.properties_id;
        try {
            const report = await fetchLLMReport(
                jwtToken, 
                propertyId,
                startDate,
                endDate
            );

            if (report) {
                reportByPropertyId[propertyId] = report;
            }
        } catch (error) {   
            console.error("Error fetching LLM report:", error);
        }
    }

    return reportByPropertyId;
};

export const useLLMReports = (session, propertyIds, startDate, endDate) => {
    return useQuery({
        queryKey: ["LLMReports"],
        queryFn: () =>
            fetchLLMReports(session, propertyIds, startDate, endDate),
        enabled:
            !!session &&
            !!propertyIds &&
            propertyIds.length > 1 &&
            !!startDate &&
            !!endDate,
    });
};