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

export const registerAccountId = async (propagateEmail, email, accountId) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${apiUrl}/register-account-id`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                propagateEmail: propagateEmail,
                email: email,
                accountId: accountId,
            }),
        });

        if (!response.ok) {
            throw new Error("AccountID registration failed");
        }
        
        console.log('AccountID registered successfully: ', email, accountId);
    } catch (error) {
        console.error("Error registering AccountID: ", error);  
    }
};

export const registerPropertyId = async (email, propertyId, propertyName, url) => {
    console.log('registerPropertyId: ', email, propertyId, propertyName);
    if (!propertyId || !propertyName) {
        alert("全ての項目を入力してください");
        return;
    }
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${apiUrl}/register-property-id`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',   
            },
            body: JSON.stringify({
                email: email,
                propertyId: propertyId,
                propertyName: propertyName,
                url: url,
            }),
        });

        if (!response.ok) {
            throw new Error("PropertyID registration failed");
        }

        console.log('PropertyID registered successfully: ', propertyId, propertyName);
    } catch (error) {
        console.error("Error registering PropertyID: ", error);
    }
};