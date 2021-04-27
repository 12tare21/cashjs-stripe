import { CashableFactory } from '../factory/cashable.factory';
import Stripe from 'stripe';
import { CashableMethodCollector } from '../collector/cashable-method.collector';

export function Cashable(stripe: Stripe, options: {
    currency: string,
    customerIdAlias?: string,
    email?: string,
}): PropertyDecorator {
    const customerIdAlias: string = options.customerIdAlias ?? 'stripeId';
    const emailAlias: string = options.email ?? 'email';
    const currency: string = options.currency;

    return function (object, propertyKey: string) {
        const factory: CashableFactory = new CashableFactory();
        Object.defineProperty(object, propertyKey, {
            configurable: false,
            get: function (this: { [name: string]: any }) {
                const email: string = this[emailAlias];
                const customerId: string = this[customerIdAlias];

                if (!this.hasOwnProperty(customerIdAlias)) {
                    throw new Error('Cashable property containing customer ID must be declared and defined.')
                }
                return new CashableMethodCollector().collect.call(this, stripe, customerIdAlias, customerId, currency, email);
            },
            set: function (this: { [name: string]: any }) {
                const email: string = this[emailAlias];
                const customerId: string = this[customerIdAlias];
                
                if (!this.hasOwnProperty(customerIdAlias)) {
                    throw new Error('Property containing customer ID must be declared and defined.')
                }
                return new CashableMethodCollector().collect.call(this, stripe, customerIdAlias, customerId, currency, email);
            }
        });

        return object;
    }
}