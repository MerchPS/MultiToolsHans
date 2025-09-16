// Vercel Serverless Function for JSONBin API proxy
const JSONBIN_API_URL = 'https://api.jsonbin.io/v3';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, storageId, binId, data, updates } = req.body;

        if (!process.env.JSONBIN_API_KEY) {
            return res.status(500).json({ error: 'JSONBin API key not configured' });
        }

        const headers = {
            'Content-Type': 'application/json',
            'X-Master-Key': process.env.JSONBIN_API_KEY
        };

        let response;

        switch (action) {
            case 'create':
                // Create a new bin
                response = await fetch(`${JSONBIN_API_URL}/b`, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'X-Bin-Name': `multitools-storage-${storageId}`,
                        'X-Bin-Private': 'true'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to create storage');
                }

                const createResult = await response.json();
                return res.status(200).json({
                    success: true,
                    binId: createResult.metadata.id,
                    message: 'Storage created successfully'
                });

            case 'get':
                // Get storage data by searching for it
                const searchResponse = await fetch(`${JSONBIN_API_URL}/c/bins`, {
                    method: 'GET',
                    headers
                });

                if (!searchResponse.ok) {
                    throw new Error('Failed to search for storage');
                }

                const bins = await searchResponse.json();
                const targetBin = bins.find(bin =>
                    bin.name === `multitools-storage-${storageId}`
                );

                if (!targetBin) {
                    return res.status(404).json({ error: 'Storage not found' });
                }

                // Get the actual data
                const dataResponse = await fetch(`${JSONBIN_API_URL}/b/${targetBin.id}/latest`, {
                    method: 'GET',
                    headers
                });

                if (!dataResponse.ok) {
                    throw new Error('Failed to retrieve storage data');
                }

                const storageData = await dataResponse.json();
                return res.status(200).json({
                    success: true,
                    binId: targetBin.id,
                    data: storageData
                });

            case 'check':
                // Check if storage exists
                const checkResponse = await fetch(`${JSONBIN_API_URL}/c/bins`, {
                    method: 'GET',
                    headers
                });

                if (!checkResponse.ok) {
                    return res.status(404).json({ error: 'Storage not found' });
                }

                const allBins = await checkResponse.json();
                const exists = allBins.some(bin =>
                    bin.name === `multitools-storage-${storageId}`
                );

                return res.status(exists ? 200 : 404).json({
                    exists,
                    message: exists ? 'Storage exists' : 'Storage not found'
                });

            case 'update':
                if (!binId) {
                    return res.status(400).json({ error: 'Bin ID required for update' });
                }

                // Get current data first
                const currentResponse = await fetch(`${JSONBIN_API_URL}/b/${binId}/latest`, {
                    method: 'GET',
                    headers
                });

                if (!currentResponse.ok) {
                    throw new Error('Failed to get current data');
                }

                const currentData = await currentResponse.json();

                // Apply updates
                const updatedData = { ...currentData };
                Object.keys(updates).forEach(key => {
                    if (key.includes('.')) {
                        // Handle nested updates like 'metadata.lastAccessed'
                        const keys = key.split('.');
                        let obj = updatedData;
                        for (let i = 0; i < keys.length - 1; i++) {
                            if (!obj[keys[i]]) obj[keys[i]] = {};
                            obj = obj[keys[i]];
                        }
                        obj[keys[keys.length - 1]] = updates[key];
                    } else {
                        updatedData[key] = updates[key];
                    }
                });

                // Update the bin
                const updateResponse = await fetch(`${JSONBIN_API_URL}/b/${binId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(updatedData)
                });

                if (!updateResponse.ok) {
                    const errorData = await updateResponse.json();
                    throw new Error(errorData.message || 'Failed to update storage');
                }

                return res.status(200).json({
                    success: true,
                    message: 'Storage updated successfully'
                });

            case 'delete':
                if (!binId) {
                    return res.status(400).json({ error: 'Bin ID required for delete' });
                }

                const deleteResponse = await fetch(`${JSONBIN_API_URL}/b/${binId}`, {
                    method: 'DELETE',
                    headers
                });

                if (!deleteResponse.ok) {
                    throw new Error('Failed to delete storage');
                }

                return res.status(200).json({
                    success: true,
                    message: 'Storage deleted successfully'
                });

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }

    } catch (error) {
        console.error('JSONBin API Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}