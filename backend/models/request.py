# models/requests.py
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional

class AnalyticsRequest(BaseModel):
    accessToken: str
    accountId: str = None
    propertyId: str = None

# class EmailRequest(BaseModel):
#     email: EmailStr

class CustomerEmailRequest(BaseModel):
    email_propagate: str
    email_customer: str

class InfoRequest(BaseModel):
    accountId: str
    propertyId: str
    propertyName: str

class InfoRequestForDB(BaseModel):
    properties: List[InfoRequest]
    email_propagate: EmailStr
    email_customer: EmailStr

class AnalyticsDataItem(BaseModel):
    pageLocation: Optional[str]
    pagePath: Optional[str]
    date: Optional[str]
    deviceCategory: Optional[str]
    sessionSource: Optional[str]
    city: Optional[str]
    firstUserSourceMedium: Optional[str]
    screenPageViews: Optional[int]
    conversions: Optional[int]
    activeUsers: Optional[int]
    sessions: Optional[int]
    engagedSessions: Optional[int]

class AnalyticsDataRequest(BaseModel):
    analyticsData: List[AnalyticsDataItem]
