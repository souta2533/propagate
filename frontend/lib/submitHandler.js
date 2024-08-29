import { setPriority } from 'os';

require('dotenv').config({ path: '.env.local' });


export const handlerUrlSubmit = async (customerEmail, propertyId, url, setUrl) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;    //await fetch(`${apiUrl}/get-properties`
        const response = await fetch(`${apiUrl}/submit-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                customerEmail: customerEmail,
                propertyId: propertyId,
                url: url}),
        });

        if (response.ok) {
            alert('URL submitted successfully!');
            setPriority('');        // フォームをクリア
            setUrl('');    
        } else {
            alert('Failed to submit URL');
        }
    } catch (error) {
        console.error('Failed to submit URL', error);
    }
}