import Stripe from 'stripe';
import { validCustomer } from './shared/common.methods';

export class PaymentIntentMethodFactory {
    public generate(stripe: Stripe, customerId: string) {
        return {
            createPaymentIntent: async (options: Stripe.PaymentIntentCreateParams): Promise<Stripe.PaymentIntent> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.paymentIntents.create(options);
            },
            retrievePaymentIntent: async (intent_id: string, options: Stripe.PaymentIntentRetrieveParams): Promise<Stripe.PaymentIntent> => {
                return stripe.paymentIntents.retrieve(intent_id, options);
            },
            cancelPaymentIntent: async (intent_id: string, options: Stripe.PaymentIntentCancelParams): Promise<Stripe.PaymentIntent> => {
                return stripe.paymentIntents.cancel(intent_id, options);
            },
            updatePaymentIntent: async (intent_id: string, options: Stripe.PaymentIntentUpdateParams): Promise<Stripe.PaymentIntent> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.paymentIntents.update(intent_id, options);
            },
            confirmPaymentIntent: async (intent_id: string, options: Stripe.PaymentIntentConfirmParams): Promise<Stripe.PaymentIntent> => {
                return stripe.paymentIntents.confirm(intent_id, options);
            },
            capturePaymentIntent: async (intent_id: string, options: Stripe.PaymentIntentUpdateParams): Promise<Stripe.PaymentIntent> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.paymentIntents.update(intent_id, options);
            },
            listPaymentIntent: async (options: Stripe.PaymentIntentListParams): Promise<Stripe.ApiListPromise<Stripe.PaymentIntent>> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.paymentIntents.list(options);
            }
        };
    }
}