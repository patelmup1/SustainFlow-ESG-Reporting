import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import Stripe from 'stripe';
import { PLANS, PlanType } from '@/lib/plans';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-01-27.acacia', // Use latest API version available or types
});

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || !session.organization_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { planId } = await request.json(); // e.g. 'STARTER' or 'PRO'

        const targetPlan = PLANS[planId as PlanType];
        if (!targetPlan || !targetPlan.stripePriceId) {
            return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: session.email,
            client_reference_id: session.organization_id,
            line_items: [
                {
                    price: targetPlan.stripePriceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
            metadata: {
                organizationId: session.organization_id,
                targetPlan: planId
            }
        });

        return NextResponse.json({ url: checkoutSession.url });

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
