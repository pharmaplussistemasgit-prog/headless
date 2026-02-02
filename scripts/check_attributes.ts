
import { getWooApi } from '../lib/woocommerce';

async function listAttributes() {
    try {
        const api = getWooApi();
        const { data } = await api.get('products/attributes');
        console.log('Attributes:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

listAttributes();
