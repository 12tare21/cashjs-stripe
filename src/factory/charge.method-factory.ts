import Stripe from 'stripe';
import { validCustomer } from './common.methods';


export class ChargeMethodFactory {
    public generate(stripe: Stripe, customerId: string) {
        return {
            createCharge: async (options: Stripe.ChargeCreateParams): Promise<Stripe.Charge> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.charges.create(options);
            },
            retrieveCharge: async (charge_id: string, options: Stripe.ChargeRetrieveParams): Promise<Stripe.Charge> => {
                return stripe.charges.retrieve(charge_id, options);
            },
            updateCharge: async (charge_id: string, options: Stripe.ChargeUpdateParams): Promise<Stripe.Charge> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.charges.update(charge_id, options);
            },
            captureCharge: async (charge_id: string, options: Stripe.ChargeUpdateParams): Promise<Stripe.Charge> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.charges.update(charge_id, options);
            },
            listCharge: async (options: Stripe.ChargeListParams): Promise<Stripe.ApiListPromise<Stripe.Charge>> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.charges.list(options);
            },
        };
    }
}
