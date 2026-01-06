import { NextResponse } from 'next/server';
import db from '@/lib/db';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-01-27.acacia',
});

export async function POST(request: Request) {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    try {
        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const orgId = session.client_reference_id;
                const targetPlan = session.metadata?.targetPlan; // 'PRO' or 'STARTER'

                if (orgId && targetPlan) {
                    console.log(`✅ Updating connection for Org ${orgId} to plan ${targetPlan}`);
                    const stmt = db.prepare('UPDATE organizations SET subscription_plan = ? WHERE id = ?');
                    stmt.run(targetPlan, orgId);
                }
                break;
            }
            case 'invoice.payment_succeeded': {
                // Handle recurring payments if needed
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
