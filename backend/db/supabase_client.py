import os
from supabase import create_client, Client
from dotenv import load_dotenv

# from db.db_operations import CustomerEmailsTable


dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
load_dotenv(dotenv_path)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# customer_emails_table = CustomerEmailsTable(supabase)