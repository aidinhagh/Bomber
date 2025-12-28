export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    // Parse Body
    let body = request.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
    }
    const { userId, username, firstName, outcome } = body;

    // Get Env Vars
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

    // Debug Log (Visible in Vercel Functions Logs)
    console.log(`Processing score for: ${firstName} (@${username}) - Result: ${outcome}`);

    if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
        console.error("ERROR: Missing TELEGRAM_BOT_TOKEN or ADMIN_CHAT_ID in Vercel Settings.");
        return response.status(500).json({ error: 'Server Config Error: Missing API Keys' });
    }

    const emoji = outcome === 'WIN' ? '✅' : '❌';
    const messageText = `
${emoji} <b>MISSION REPORT</b>

<b>Agent:</b> ${firstName} (@${username})
<b>ID:</b> <code>${userId}</code>
<b>Result:</b> ${outcome}
    `;

    try {
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
            console.error('Telegram API rejected the message:', data);
            return response.status(500).json({ error: 'Telegram Error', details: data.description });
        }

        return response.status(200).json({ success: true });

    } catch (error) {
        console.error('Function execution error:', error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
