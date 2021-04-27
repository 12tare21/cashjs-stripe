import Stripe from 'stripe';
import { validCustomer } from './shared/common.methods';

export class SourceMethodFactory {
    public generate(stripe: Stripe, customerId: string) {
        return {
            createSource: async (options: Stripe.SourceCreateParams): Promise<Stripe.Source> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.sources.create(options);
            },
            retrieveSource: async (source_id: string, options: Stripe.SourceRetrieveParams): Promise<Stripe.Source> => {
                return stripe.sources.retrieve(source_id, options);
            },
            updateSource: async (source_id: string, options: Stripe.SourceUpdateParams): Promise<Stripe.Source> => {
                return stripe.sources.update(source_id, options);
            },
            attachSource: async (options: Stripe.CustomerSourceCreateParams): Promise<Stripe.Response<Stripe.CustomerSource>> => {
                const customer: string = (await validCustomer(stripe, customerId)).id;
                return stripe.customers.createSource(customer, options);
            },
            detachSource: async (source_id: string, options: Stripe.CustomerSourceDeleteParams): Promise<Stripe.Response<Stripe.CustomerSource | any>> => {
                const customer: string = (await validCustomer(stripe, customerId)).id;
                return stripe.customers.deleteSource(customer, source_id, options);
            },
        };
    }
}