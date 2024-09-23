import React, { useEffect } from "react";

const countScreenViewsByPropertyId = async (url) => {
  try {
    const { data: properties, error: propertyError } = await supabase
      .from("PropertyTable")
      .select("properties_id")
      .eq("url", url);

    if (propertyError) {
      throw new Error("Error fetchin property id : ${propertyError.message}");
    }

    if (properties.length === 0) {
      console.log("No property foound for the given URL.");
      return 0;
    }

    const propertyId = properties[0].properties_id;
    console.log(`Property ID for the given URL: ${propertyId}`);

    const { data: analyticsData, error: analyticsError } = await supabase
      .from("AnalyticsData")
      .select("screen_page_views")
      .eq("property_id", propertyId);

    if (analyticsError) {
      throw new Error(
        `Error fetching analytics data: ${analyticsError.message}`
      );
    }

    let totalScreenViews = 0;
    for (let i = 0; i < analyticsData.length; i++) {
      totalScreenViews += analyticsData[i].screen_page_views || 0;
    }

    console.log(
      `Total screen views for property ID ${propertyId}: ${totalScreenViews}`
    );
    return totalScreenViews;
  } catch (error) {
    console.error("Error in countScreenViewsByPropertyId: ", error);
    return 0;
  }
};

const url = "https://www.propagate-fsk.tokyo/recruit";

async function fetchData() {
  const data = await supabase
    .from("AnalyticsData")
    .select("*")
    .eq("property_id", propertyId);
  console.log(data);
}
//console.log(`Total screen views for the URL: ${totalViews}`);
fetchData();
