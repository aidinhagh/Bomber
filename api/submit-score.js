export default async function handler(request, response) {
    // 1. Only allow POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Parse the body
    const { userId, username, firstName, outcome } = request.body;

    // 3. Get Environment Variables (Set these in Vercel!)
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

    if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
        return response.status(500).json({ error: 'Server configuration error (Missing Env Vars)' });
    }

    // 4. Construct the message for the Admin
    const emoji = outcome === 'WIN' ? '✅' : '❌';
    const messageText = `
${emoji} <b>MISSION REPORT</b>

<b>Agent:</b> ${firstName} (@${username})
<b>ID:</b> <code>${userId}</code>
<b>Result:</b> ${outcome}
    `;

    try {
        // 5. Send to Telegram API
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        
        const tgResponse = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: messageText,
                parse_mode: 'HTML'
            })
        });

        const data = await tgResponse.json();

        if (!data.ok) {
            console.error('Telegram API Error:', data);
            return response.status(500).json({ error: 'Failed to notify admin' });
        }

        return response.status(200).json({ success: true });

    } catch (error) {
        console.error('Function Error:', error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
