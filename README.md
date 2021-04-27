

<span style="color:white;font-size:14px">Note: library still in development stage</span>
## Introduction

Cashjs simplifies implementation of Stripe customer API-s in your Node.js app. By adding decorated property with <span style="color:white">@Cashable</span>, your entity gets decored with implementation of stripe customer api methods for charges, payment intents, sources, payment methods, invoices, balance transactions.

## Usage

Example of decorated class with @Cashable would be :

    class User{
        @Cashable({stripe}) let cashjs;

        let stripeId; 
        let email;
    }

Now our User instances automaticaly resolve Stripe customer and email when they call stripe methods over cashjs, so every instance of user is linked with one Stripe customer, their email is used for stripe invoices:

    let user = new User();

    user.cashjs.createStripeCustomer(); // Initializes stripeId to be used as reference to new Stripe customer 

    user.cashjs.addPaymentMethod({
                type: 'card',
                card: {
                    number: '4242424242424242',
                    exp_month: 1,
                    exp_year: 2022,
                    cvc: '314',
                },
            }
    );

    user.cashjs.charge(500); // charges user for 500 in default currency

If you name differently properties of decorated class like email or stripeId, you should notify Cashable by passing property names as decorator parameters, or you want to change default currency when calling methods:

    class User{
        // ...
        
        @Cashable({
            stripe: stripe,
            email: "contactEmail",
            currency: "EUR",
            stripeId: "customerId"
        }) let cashjs;

        let customerId;
        let contactEmail;
        
        // ...
    }

Now you have your decorated intances able to call cashjs custom implementations calling stripe methods like: 
<pre>
    // Get valid not deleted customer for cashable entity instance
    <b>validCustomer</b>: async (): Promise<Stripe.Customer> 

    // Add payment method to customer
    <b>addPaymentMethod</b>: async (options: any = {}) 

    // Check if this customer has payment method attached
    <b>hasPaymentMethod</b>: async (paymentMethodId: string): Promise<boolean> 

    // Retrieves payment methods for cashable entity instance
    <b>paymentMethods</b>: async (options: any = {}): Promise<Stripe.ApiList<Stripe.PaymentMethod>> 

    // Retrieves default payment method for cashable entity instance
    <b>defaultPaymentMethod</b>: async (): Promise<Stripe.PaymentMethod | null> 

    // Creates stripe customer and initialize customer ID to cashable entity instance
    <b>createStripeCustomer</b>: async (options: Stripe.CustomerCreateParams) 

    // Removes customer from stripe and sets customer ID property on null
    <b>removeStripeCustomer</b>: async () 

    // Check if customer has payment method attached
    <b>assertPaymentMethod</b>: async (paymentMethodId: string) 

    // Set default payment method for customer
    <b>setDefaultPaymentMethod</b>: async (paymentMethodId: string) 

    // Make a charge on the customer for the given amount on default payment method.
    <b>charge</b>: async (amount: number, options: any = {}) 

    // Refund payment for customer 
    <b>refund</b>: async (paymentIntentId: string, options: any = {}) 

    // Add invoice item for customer
    <b>addInvoiceItem</b>: async (description: string, amount: number, options: any = {}) 

    // Invoice the cashable entity for given amount immediately
    <b>invoiceFor</b>: async (description: string, amount: number, itemOptions: any = {}, invoiceOptions: any = {}) 

    // Executes balance transaction to customer for given amount
    <b>fillBalance</b>: async (amount: number, options: any = {}) 

    // Get a list of the invoices for customer.
    <b>invoices</b>: async (options: Stripe.InvoiceListParams) 

    // Get the entity's upcoming invoice.
    <b>upcomingInvoice</b>: async (options: Stripe.InvoiceRetrieveUpcomingParams) 

    // Get the Stripe customer for the entity.
    <b>asStripeCustomer</b>: async ()  
</pre>
As well you have available all Stripe Api for Node.js original methods, their docs is on https://stripe.com/docs/api and their implementation can be called on properties:

    user.cashjs._intents
    user.cashjs._charges
    user.cashjs._invoices
    user.cashjs._invoiceItems
    user.cashjs._balacneTransactions
    user.cashjs._customers
    user.cashjs._sources
    user.cashjs._paymentMethods

More examples of usage can be found in UseCase controller under <b>src/controllers</b> dir.

