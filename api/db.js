const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'lautyortiz987-wq';
const REPO = 'appbarber';
const PATH = 'database.json';
const BRANCH = 'main';

const GITHUB_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const headers = {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'BarberPro-App'
    };

    // GET — leer database.json
    if (req.method === 'GET') {
        const response = await fetch(`${GITHUB_URL}?ref=${BRANCH}`, { headers });
        const data = await response.json();
        return res.status(response.status).json(data);
    }

    // PUT — guardar database.json
    if (req.method === 'PUT') {
        const response = await fetch(GITHUB_URL, {
            method: 'PUT',
            headers,
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        return res.status(response.status).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
