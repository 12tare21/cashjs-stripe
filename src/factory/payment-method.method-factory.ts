import Stripe from 'stripe';
import { validCustomer } from './common.methods';
import { assertPaymentMethod } from './common.methods';

export class PaymentMethodMethodFactory {
    public generate(stripe: Stripe, customerId: string) {
        return {
            createPaymentMethod: async (options: Stripe.PaymentMethodCreateParams): Promise<Stripe.PaymentMethod> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.paymentMethods.create(options);
            },
            retrievePaymentMethod: async (paymentMethodId: string, options: Stripe.PaymentMethodRetrieveParams): Promise<Stripe.PaymentMethod> => {
                return stripe.paymentMethods.retrieve(paymentMethodId, options);
            },
            updatePaymentMethod: async (paymentMethodId: string, options: Stripe.PaymentMethodUpdateParams): Promise<Stripe.PaymentMethod> => {
                assertPaymentMethod(stripe, customerId, paymentMethodId);
                return stripe.paymentMethods.update(paymentMethodId, options);
            },
            listPaymentMethods: async (options: Stripe.PaymentMethodListParams): Promise<Stripe.ApiListPromise<Stripe.PaymentMethod>> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.paymentMethods.list(options);
            },
            detachPaymentMethod: async (paymentMethodId: string, options: Stripe.PaymentMethodDetachParams): Promise<Stripe.PaymentMethod> => {
                assertPaymentMethod(stripe, customerId, paymentMethodId);
                return stripe.paymentMethods.detach(paymentMethodId, options);
            },
        };
    }
}