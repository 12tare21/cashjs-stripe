import Stripe from 'stripe';
import { validCustomer } from './shared/common.methods';

export class InvoiceMethodFactory {
    public generate(stripe: Stripe, customerId: string) {
        return {
            createInvoice: async (options: Stripe.InvoiceCreateParams): Promise<Stripe.Invoice> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.invoices.create(options);
            },
            retrieveInvoice: async (invoice_id: string, options: Stripe.InvoiceRetrieveParams): Promise<Stripe.Invoice> => {
                return stripe.invoices.retrieve(invoice_id, options);
            },
            updateInvoice: async (invoice_id: string, options: Stripe.InvoiceUpdateParams): Promise<Stripe.Invoice> => {
                return stripe.invoices.update(invoice_id, options);
            },
            captureInvoice: async (invoice_id: string, options: Stripe.InvoiceUpdateParams): Promise<Stripe.Invoice> => {
                return stripe.invoices.update(invoice_id, options);
            },
            listInvoice: async (options: Stripe.InvoiceListParams): Promise<Stripe.ApiListPromise<Stripe.Invoice>> => {
                options.customer = (await validCustomer(stripe, customerId)).id;
                return stripe.invoices.list(options);
            },
            pay: async (invoice_id: string, options: Stripe.InvoicePayParams): Promise<Stripe.Invoice> => {
                return stripe.invoices.pay(invoice_id, options);
            },
            finalize: async (invoice_id: string, options: Stripe.InvoiceFinalizeInvoiceParams): Promise<Stripe.Invoice> => {
                return stripe.invoices.finalizeInvoice(invoice_id, options);
            },
            send: async (invoice_id: string, options: Stripe.InvoiceSendInvoiceParams): Promise<Stripe.Invoice> => {
                return stripe.invoices.sendInvoice(invoice_id, options);
            },
        };
    }
}