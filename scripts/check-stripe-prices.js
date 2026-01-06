const Stripe = require('stripe');

// Read from .env manually since we are running a script
const fs = require('fs');
const path = require('path');
const dotenv = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');

const keyMatch = dotenv.match(/STRIPE_SECRET_KEY=(sk_test_[a-zA-Z0-9]+)/);
const key = keyMatch ? keyMatch[1] : null;

if (!key) {
    console.error('❌ Could not find STRIPE_SECRET_KEY in .env');
    process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: '2025-01-27.acacia' });

async function listPrices() {
    try {
        console.log('🔄 Fetching Prices from Stripe...');
        const prices = await stripe.prices.list({ limit: 10, expand: ['data.product'] });

        if (prices.data.length === 0) {
            console.log('⚠️ No prices found in this Stripe account.');
            console.log('   Please create "Starter" and "Pro" products in your Stripe Dashboard.');
            return;
        }

        console.log('\n✅ Found the following Prices:');
        prices.data.forEach(p => {
            const productName = typeof p.product === 'string' ? p.product : p.product.name;
            console.log(`- Product: "${productName}" | Price ID: ${p.id} | Amount: ${p.unit_amount / 100} ${p.currency.toUpperCase()}`);
        });

    } catch (error) {
        console.error('❌ Error fetching prices:', error.message);
    }
}

listPrices();
