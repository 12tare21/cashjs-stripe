import Stripe from 'stripe';
import { validCustomer } from './shared/common.methods';

export class InvoiceItemMethodFactory {
    public generate(stripe: Stripe, customerId: string) {
        return {
            createInvoiceItem: async (options: Stripe.InvoiceItemCreateParams): Promise<Stripe.InvoiceItem> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.invoiceItems.create(options);
            },
            retrieveInvoiceItem: async (intent_id: string, options: Stripe.InvoiceItemRetrieveParams): Promise<Stripe.InvoiceItem> => {
                return stripe.invoiceItems.retrieve(intent_id, options);
            },
            updateInvoiceItem: async (intent_id: string, options: Stripe.InvoiceItemUpdateParams): Promise<Stripe.InvoiceItem> => {
                return stripe.invoiceItems.update(intent_id, options);
            },
            captureInvoiceItem: async (intent_id: string, options: Stripe.InvoiceItemUpdateParams): Promise<Stripe.InvoiceItem> => {
                return stripe.invoiceItems.update(intent_id, options);
            },
            listInvoiceItems: async (options: Stripe.InvoiceItemListParams): Promise<Stripe.ApiListPromise<Stripe.InvoiceItem>> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.invoiceItems.list(options);
            },
        };
    }
}
