require('dotenv').config({ path: '.env.local' });


export const handlerUrlSubmit = async (customerEmail, url, setUrl) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;    //await fetch(`${apiUrl}/get-properties`
        const response = await fetch(`${apiUrl}/submit-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                customerEmail: customerEmail,
                url: url}),
        });

        if (response.ok) {
            alert('URL submitted successfully!');
            setUrl('');     // フォームをクリア
        } else {
            alert('Failed to submit URL');
        }
    } catch (error) {
        console.error('Failed to submit URL', error);
    }
}