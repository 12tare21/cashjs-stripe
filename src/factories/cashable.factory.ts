import Stripe from 'stripe';

export class CashableFactory {
    public generate(stripe: Stripe, cusPropName: string, customerId: string, currency: string){
        const cashjs = {
            // Get valid not deleted customer for cashable entity instance
            validCustomer: async (): Promise<Stripe.Customer> => {
                if (typeof customerId !== 'string'){
                    throw new Error('Provided customer ID is invalid');
                }
                const customer: Stripe.Customer | Stripe.DeletedCustomer = await (stripe.customers.retrieve(customerId));
                if(customer.deleted){
                    throw new Error('This customer has been deleted');
                }
                return customer as Stripe.Customer;
            },
            // Add payment method to customer
            addPaymentMethod: async(options: any = {}) => {
                const customer: Stripe.Customer = await cashjs.validCustomer();
                const paymentMethod: Stripe.PaymentMethod = await stripe.paymentMethods.create({...options, type: options.type});
                
                if (cashjs.defaultPaymentMethod() === null) {
                    await stripe.customers.update(customer.id, {
                        invoice_settings: {
                            default_payment_method: paymentMethod.id
                        }
                    });
                }

                return stripe.paymentMethods.attach(paymentMethod.id, {customer: customer.id});
            },
            // Check if this customer has payment method attached
            hasPaymentMethod: async (paymentMethodId: string): Promise<boolean> => {
                const customer: Stripe.Customer = await cashjs.validCustomer();
                const paymentMethod: Stripe.PaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
                
                if(customer.id === paymentMethod.customer){
                    return true;
                }
                return false;
            },
            // Retrieves payment methods for cashable entity instance
            paymentMethods: async (options: any = {}): Promise<Stripe.ApiList<Stripe.PaymentMethod>> => {
                const customer: Stripe.Customer = await cashjs.validCustomer();
                return stripe.paymentMethods.list({... options, customer: customer.id});
            },
            // Retrieves payment default method for cashable entity instance
            defaultPaymentMethod: async (): Promise<Stripe.PaymentMethod | null> => {
                const customer: Stripe.Customer = await cashjs.validCustomer();
                const paymentMethod: any = customer.invoice_settings.default_payment_method;
                
                if (typeof paymentMethod === 'string'){
                    return stripe.paymentMethods.retrieve(paymentMethod);
                } else if (paymentMethod === undefined || paymentMethod === null){
                    return null;
                }

                return paymentMethod as Stripe.PaymentMethod;
            },
            // Creates stripe customer and initialize customer ID to cashable entity instance
            createStripeCustomer: async (options: Stripe.CustomerCreateParams) => {
                const customer: Stripe.Customer = await stripe.customers.create(options);
                
                this[cusPropName] = customer.id;
            },
            // Removes customer from stripe and sets customer ID property on null
            removeStripeCustomer: async () => {
                const customer: Stripe.DeletedCustomer = await stripe.customers.del(customerId);
                this[cusPropName] = null;
                return customer;
            },
            // Check if customer has payment method attached
            assertPaymentMethod: async(paymentMethodId: string) => {
                if (!cashjs.hasPaymentMethod(paymentMethodId)){
                    throw new Error('Customer has no payment method with this ID.')
                }
            },
            // Set default payment method for customer
            setDefaultPaymentMethod: async (paymentMethodId: string) => {
                cashjs.assertPaymentMethod(paymentMethodId);

                return stripe.customers.update(
                    customerId, {
                        'invoice_settings':{
                            'default_payment_method': paymentMethodId
                        }
                    }
                );
            },
            // Make a charge on the customer for the given amount on default payment method.
            charge: async(amount: number, options: any = {}) => {
                const customer: Stripe.Customer = await cashjs.validCustomer();

                const params: Stripe.PaymentIntentCreateParams = {
                    confirmation_method: 'automatic',
                    confirm: true,
                    currency: currency,
                    amount: amount,
                    payment_method: customer.invoice_settings.default_payment_method,
                    ... options,
                    customer: (await cashjs.validCustomer()).id,
                }

                return stripe.paymentIntents.create(params);
            },
            // Refund payment for customer 
            refund: async(paymentIntentId: string, options: any = {}) => {
                await cashjs.validCustomer();
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

                if(paymentIntent?.customer !== customerId){
                    throw new Error('This customer has not created payment intent with this ID');
                }

                return stripe.refunds.create({
                    ... options,
                    payment_intent: paymentIntentId,
                })
            },
            // Add invoice item for customer
            addInvoiceItem: async(description: string, amount: number, options: any = {}) => {
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
                    ... invoiceOptions,
                });
            },
            // Executes ballance transaction to customer for given amount
            fillBallance: async (amount: number, options: any = {}) => {
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

                return stripe.invoices.list({...options, customer: customerId});
            },
            // Get the entity's upcoming invoice.
            upcomingInvoice: async (options: Stripe.InvoiceRetrieveUpcomingParams) => {
                await cashjs.validCustomer();

                return stripe.invoices.retrieveUpcoming({...options, customer: customerId});
            },
            // Get the Stripe customer for the entity.
            asStripeCustomer: async () => {
                return cashjs.validCustomer();
            },
            // All common stripe methods with automatic customer resolvement on cashable entity
            _intents:  {
                createPaymentIntent: async (options: Stripe.PaymentIntentCreateParams ): Promise<Stripe.PaymentIntent> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.paymentIntents.create(options);
                },
                retrievePaymentIntent: async (intent_id: string, options: Stripe.PaymentIntentRetrieveParams ): Promise<Stripe.PaymentIntent> => {
                    return stripe.paymentIntents.retrieve(intent_id, options);
                },
                cancelPaymentIntent: async (intent_id: string, options: Stripe.PaymentIntentCancelParams ): Promise<Stripe.PaymentIntent> => {
                    return stripe.paymentIntents.cancel(intent_id, options);
                },
                updatePaymentIntent: async (intent_id: string, options: Stripe.PaymentIntentUpdateParams ): Promise<Stripe.PaymentIntent> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.paymentIntents.update(intent_id, options);
                },
                confirmPaymentIntent: async (intent_id: string, options: Stripe.PaymentIntentConfirmParams ): Promise<Stripe.PaymentIntent> => {
                    return stripe.paymentIntents.confirm(intent_id, options);
                },
                capturePaymentIntent: async (intent_id: string, options: Stripe.PaymentIntentUpdateParams ): Promise<Stripe.PaymentIntent> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.paymentIntents.update(intent_id, options);
                },
                listPaymentIntent: async (options: Stripe.PaymentIntentListParams ): Promise<Stripe.ApiListPromise<Stripe.PaymentIntent>> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.paymentIntents.list(options);
                },
            },
            _charges:  {
                createCharge: async (options: Stripe.ChargeCreateParams ): Promise<Stripe.Charge> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.charges.create(options);
                },
                retrieveCharge: async (charge_id: string, options: Stripe.ChargeRetrieveParams ): Promise<Stripe.Charge> => {
                    return stripe.charges.retrieve(charge_id, options);
                },
                updateCharge: async (charge_id: string, options: Stripe.ChargeUpdateParams ): Promise<Stripe.Charge> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.charges.update(charge_id, options);
                },
                captureCharge: async (charge_id: string, options: Stripe.ChargeUpdateParams ): Promise<Stripe.Charge> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.charges.update(charge_id, options);
                },
                listCharge: async (options: Stripe.ChargeListParams ): Promise<Stripe.ApiListPromise<Stripe.Charge>> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.charges.list(options);
                },
            },
            _invoices:  {
                createInvoice: async (options: Stripe.InvoiceCreateParams ): Promise<Stripe.Invoice> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.invoices.create(options);
                },
                retrieveInvoice: async (invoice_id: string, options: Stripe.InvoiceRetrieveParams ): Promise<Stripe.Invoice> => {
                    return stripe.invoices.retrieve(invoice_id, options);
                },
                updateInvoice: async (invoice_id: string, options: Stripe.InvoiceUpdateParams ): Promise<Stripe.Invoice> => {
                    return stripe.invoices.update(invoice_id, options);
                },
                captureInvoice: async (invoice_id: string, options: Stripe.InvoiceUpdateParams ): Promise<Stripe.Invoice> => {
                    return stripe.invoices.update(invoice_id, options);
                },
                listInvoice: async (options: Stripe.InvoiceListParams ): Promise<Stripe.ApiListPromise<Stripe.Invoice>> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.invoices.list(options);
                },
                pay: async (invoice_id: string, options: Stripe.InvoicePayParams ): Promise<Stripe.Invoice> => {
                    return stripe.invoices.pay(invoice_id, options);
                },
                finalize: async (invoice_id: string, options: Stripe.InvoiceFinalizeInvoiceParams ): Promise<Stripe.Invoice> => {
                    return stripe.invoices.finalizeInvoice(invoice_id, options);
                },
                send: async (invoice_id: string, options: Stripe.InvoiceSendInvoiceParams ): Promise<Stripe.Invoice> => {
                    return stripe.invoices.sendInvoice(invoice_id, options);
                },
            },
            _invoiceItems:  {
                createInvoiceItem: async (options: Stripe.InvoiceItemCreateParams ): Promise<Stripe.InvoiceItem> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.invoiceItems.create(options);
                },
                retrieveInvoiceItem: async (intent_id: string, options: Stripe.InvoiceItemRetrieveParams ): Promise<Stripe.InvoiceItem> => {
                    return stripe.invoiceItems.retrieve(intent_id, options);
                },
                updateInvoiceItem: async (intent_id: string, options: Stripe.InvoiceItemUpdateParams ): Promise<Stripe.InvoiceItem> => {
                    return stripe.invoiceItems.update(intent_id, options);
                },
                captureInvoiceItem: async (intent_id: string, options: Stripe.InvoiceItemUpdateParams ): Promise<Stripe.InvoiceItem> => {
                    return stripe.invoiceItems.update(intent_id, options);
                },
                listInvoiceItems: async (options: Stripe.InvoiceItemListParams ): Promise<Stripe.ApiListPromise<Stripe.InvoiceItem>> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.invoiceItems.list(options);
                },
            },
            _balacneTransactions:  {
                createCustomerBalanceTransaction: async (customer_id: string, options: Stripe.CustomerBalanceTransactionCreateParams ): Promise<Stripe.CustomerBalanceTransaction> => {
                    return stripe.customers.createBalanceTransaction(customer_id, options);
                },
                retrieveCustomerBalanceTransaction: async (customer_id: string, transaction_id: string, options: Stripe.CustomerBalanceTransactionRetrieveParams ): Promise<Stripe.CustomerBalanceTransaction> => {
                    return stripe.customers.retrieveBalanceTransaction(customer_id, transaction_id, options);
                },
                updateCustomerBalanceTransaction: async (customer_id: string, transaction_id: string, options: Stripe.CustomerBalanceTransactionUpdateParams ): Promise<Stripe.CustomerBalanceTransaction> => {
                    return stripe.customers.updateBalanceTransaction(customer_id, transaction_id, options);
                },
                listCustomerBalanceTransaction: async (customer_id: string, options: Stripe.CustomerBalanceTransactionListParams ): Promise<Stripe.ApiListPromise<Stripe.CustomerBalanceTransaction>> => {
                    return stripe.customers.listBalanceTransactions(customer_id, options);
                },
            },
            _customers: {
                createCustomer: async (options: Stripe.CustomerCreateParams ): Promise<Stripe.Customer> => {
                    return stripe.customers.create(options);
                },
                retrieveCustomer: async (customer_id: string, options: Stripe.CustomerRetrieveParams ): Promise<Stripe.Customer | Stripe.DeletedCustomer> => {
                    return stripe.customers.retrieve(customer_id, options);
                },
                updateCustomer: async (customer_id: string, options: Stripe.CustomerUpdateParams ): Promise<Stripe.Customer> => {
                    return stripe.customers.update(customer_id, options);
                },
                listCustomers: async (options: Stripe.CustomerListParams ): Promise<Stripe.ApiListPromise<Stripe.Customer>> => {
                    return stripe.customers.list(options);
                },
            },
            _sources: {
                createSource: async (options: Stripe.SourceCreateParams ): Promise<Stripe.Source> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.sources.create(options);
                },
                retrieveSource: async (source_id: string, options: Stripe.SourceRetrieveParams ): Promise<Stripe.Source> => {
                    return stripe.sources.retrieve(source_id, options);
                },
                updateSource: async (source_id: string, options: Stripe.SourceUpdateParams ): Promise<Stripe.Source> => {
                    return stripe.sources.update(source_id, options);
                },
                attachSource: async (options: Stripe.CustomerSourceCreateParams ): Promise<Stripe.Response<Stripe.CustomerSource>> => {
                    const customer: string = (await cashjs.validCustomer()).id;
                    return stripe.customers.createSource(customer, options);
                },
                detachSource: async (source_id: string, options: Stripe.CustomerSourceDeleteParams): Promise<Stripe.Response<Stripe.CustomerSource | any>>=> {
                    const customer: string = (await cashjs.validCustomer()).id;
                    return stripe.customers.deleteSource(customer, source_id, options);
                },
            },
            _paymentMethods: {
                createPaymentMethod: async (options: Stripe.PaymentMethodCreateParams ): Promise<Stripe.PaymentMethod> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.paymentMethods.create(options);
                },
                retrievePaymentMethod: async (paymentMethodId: string, options: Stripe.PaymentMethodRetrieveParams ): Promise<Stripe.PaymentMethod> => {
                    return stripe.paymentMethods.retrieve(paymentMethodId, options);
                },
                updatePaymentMethod: async (paymentMethodId: string, options: Stripe.PaymentMethodUpdateParams ): Promise<Stripe.PaymentMethod> => {
                    cashjs.assertPaymentMethod(paymentMethodId);
                    return stripe.paymentMethods.update(paymentMethodId, options);
                },
                listPaymentMethods: async (options: Stripe.PaymentMethodListParams ): Promise<Stripe.ApiListPromise<Stripe.PaymentMethod>> => {
                    options.customer = (await cashjs.validCustomer()).id;
                    return stripe.paymentMethods.list(options);
                },
                detachPaymentMethod: async (paymentMethodId: string, options: Stripe.PaymentMethodDetachParams ): Promise<Stripe.PaymentMethod> => {
                    cashjs.assertPaymentMethod(paymentMethodId);
                    return stripe.paymentMethods.detach(paymentMethodId, options);
                },
            }
        }

        return cashjs;
    }
}