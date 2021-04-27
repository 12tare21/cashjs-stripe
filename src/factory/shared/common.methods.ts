import Stripe from 'stripe';

export async function validCustomer(stripe: Stripe, customerId: string): Promise<Stripe.Customer> {
    if (typeof customerId !== 'string') {
        throw new Error('Provided customer ID is invalid');
    }
    const customer: Stripe.Customer | Stripe.DeletedCustomer = await (stripe.customers.retrieve(customerId));
    if (customer.deleted) {
        throw new Error('This customer has been deleted');
    }
    return customer as Stripe.Customer;
}

export async function assertPaymentMethod(stripe: Stripe, customerId: string, paymentMethodId: string) {
    const customer: Stripe.Customer = await validCustomer(stripe, customerId);
    const paymentMethod: Stripe.PaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (customer.id !== paymentMethod.customer) {
        throw new Error('Customer has no payment method with this ID.')
    }
}