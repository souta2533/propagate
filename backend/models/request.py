# models/requests.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional

class AnalyticsRequest(BaseModel):
    accessToken: str
    refreshToken: str
    accountId: str = None
    propertyId: str = None
    startDate: str 
    endDate: str

class CustomerEmailRequest(BaseModel):
    email_propagate_id: int
    email_customer: str

class InfoRequest(BaseModel):
    accountId: str
    propertyId: str
    propertyName: str

class InfoRequestForDB(BaseModel):
    properties: List[InfoRequest]
    email_propagate_id: int
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

class SearchConsoleRequest(BaseModel):
    accessToken: str
    refreshToken: str
    url: str
    startDate: str
    endDate: str

class SearchConsoleItem(BaseModel):
    pass

class SearchConsoleDataRequest(BaseModel):
    searchConsoleData: List[SearchConsoleItem]

# URLを受け取る
# class URLRequest(BaseModel):
#     customerEmail: str
#     propertyId: int
#     url: str
class URLRequest(BaseModel):
    email: str
    url: str

# Userの新規登録（email）
class RegisterUser(BaseModel):
    email: str
    userId: str

# AccountIDの取得
class RegisterAccountId(BaseModel):
    propagateEmail: str
    userId: str
    email: str
    accountId: str

# UserのURLの追加
class RegisterUrl(BaseModel):
    email: str
    propertyId: str
    propertyName: str
    url: str