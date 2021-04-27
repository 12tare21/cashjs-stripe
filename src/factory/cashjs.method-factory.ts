import Stripe from 'stripe';
import { validCustomer } from './shared/common.methods';
import { assertPaymentMethod } from './shared/common.methods';

export class CashjsMethodFactory {
    public generate(stripe: Stripe, customerIdAlias: string, customerId: string, currency: string, email: string) {
        const cashjs = {
            // Get valid not deleted customer for cashable entity instance
            validCustomer: async (): Promise<Stripe.Customer> => {
                return validCustomer(stripe, customerId);
            },
            // Add payment method to customer
            addPaymentMethod: async (options: any = {}) => {
                const customer: Stripe.Customer = await cashjs.validCustomer();
                const paymentMethod: Stripe.PaymentMethod = await stripe.paymentMethods.create({ ...options, type: options.type });

                if (cashjs.defaultPaymentMethod() === null) {
                    await stripe.customers.update(customer.id, {
                        invoice_settings: {
                            default_payment_method: paymentMethod.id
                        }
                    });
                }

                return stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });
            },
            // Check if this customer has payment method attached
            hasPaymentMethod: async (paymentMethodId: string): Promise<boolean> => {
                const customer: Stripe.Customer = await cashjs.validCustomer();
                const paymentMethod: Stripe.PaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

                if (customer.id === paymentMethod.customer) {
                    return true;
                }
                return false;
            },
            // Retrieves payment methods for cashable entity instance
            paymentMethods: async (options: any = {}): Promise<Stripe.ApiList<Stripe.PaymentMethod>> => {
                const customer: Stripe.Customer = await cashjs.validCustomer();
                return stripe.paymentMethods.list({ ...options, customer: customer.id });
            },
            // Retrieves payment default method for cashable entity instance
            defaultPaymentMethod: async (): Promise<Stripe.PaymentMethod | null> => {
                const customer: Stripe.Customer = await cashjs.validCustomer();
                const paymentMethod: any = customer.invoice_settings.default_payment_method;

                if (typeof paymentMethod === 'string') {
                    return stripe.paymentMethods.retrieve(paymentMethod);
                } else if (paymentMethod === undefined || paymentMethod === null) {
                    return null;
                }

                return paymentMethod as Stripe.PaymentMethod;
            },
            // Creates stripe customer and initialize customer ID to cashable entity instance
            createStripeCustomer: async (options: Stripe.CustomerCreateParams) => {
                const customer: Stripe.Customer = await stripe.customers.create({ email, ...options });

                this[customerIdAlias] = customer.id;
            },
            // Removes customer from stripe and sets customer ID property on null
            removeStripeCustomer: async () => {
                const customer: Stripe.DeletedCustomer = await stripe.customers.del(customerId);
                this[customerIdAlias] = null;
                return customer;
            },
            // Check if customer has payment method attached
            assertPaymentMethod: async (paymentMethodId: string) => {
                return assertPaymentMethod(stripe, customerId, paymentMethodId);
            },
            // Set default payment method for customer
            setDefaultPaymentMethod: async (paymentMethodId: string) => {
                cashjs.assertPaymentMethod(paymentMethodId);

                return stripe.customers.update(
                    customerId, {
                    'invoice_settings': {
                        'default_payment_method': paymentMethodId
                    }
                }
                );
            },
            // Make a charge on the customer for the given amount on default payment method.
            charge: async (amount: number, options: any = {}) => {
                const customer: Stripe.Customer = await cashjs.validCustomer();

                const params: Stripe.PaymentIntentCreateParams = {
                    confirmation_method: 'automatic',
                    confirm: true,
                    currency: currency,
                    amount: amount,
                    payment_method: customer.invoice_settings.default_payment_method,
                    ...options,
                    customer: (await cashjs.validCustomer()).id,
                }

                return stripe.paymentIntents.create(params);
            },
            // Refund payment for customer 
            refund: async (paymentIntentId: string, options: any = {}) => {
                await cashjs.validCustomer();
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

                if (paymentIntent?.customer !== customerId) {
                    throw new Error('This customer has not created payment intent with this ID');
                }

                return stripe.refunds.create({
                    ...options,
                    payment_intent: paymentIntentId,
                })
            },
            // Add invoice item for customer
            addInvoiceItem: async (description: string, amount: number, options: any = {}) => {
                await cashjs.validCustomer();

                return stripe.invoiceItems.create({
                    customer: customerId,
                    currency: currency,
                    amount: amount,
                    description: description,
                    ...options
                });
            },
            // Invoice the cashable entity for given amount immediately
            invoiceFor: async (description: string, amount: number, itemOptions: any = {}, invoiceOptions: any = {}) => {
                await cashjs.validCustomer();

                await cashjs.addInvoiceItem(description, amount, itemOptions);

                return stripe.invoices.create({
                    customer: customerId,
                    ...invoiceOptions,
                });
            },
            // Executes balance transaction to customer for given amount
            fillBalance: async (amount: number, options: any = {}) => {
                const customer: Stripe.Customer = await cashjs.validCustomer();

                return stripe.customers.createBalanceTransaction(customer.id, {
                    currency: currency,
                    amount: amount,
                    ...options,
                });
            },
            // Get a list of the invoices for customer.
            invoices: async (options: Stripe.InvoiceListParams) => {
                await cashjs.validCustomer();

                return stripe.invoices.list({ ...options, customer: customerId });
            },
            // Get the entity's upcoming invoice.
            upcomingInvoice: async (options: Stripe.InvoiceRetrieveUpcomingParams) => {
                await cashjs.validCustomer();

                return stripe.invoices.retrieveUpcoming({ ...options, customer: customerId });
            },
            // Get the Stripe customer for the entity.
            asStripeCustomer: async () => {
                return cashjs.validCustomer();
            },
        };

        return cashjs;
    }
}