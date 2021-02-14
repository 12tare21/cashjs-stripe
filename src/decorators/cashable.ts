import { CashableFactory } from 'src/factories/cashable.factory';
import Stripe from 'stripe';

export function Cashable(stripe: Stripe, options: {
    currency: string,
    cusPropName?: string,
    email?: string,
}): PropertyDecorator {
    const cusPropName: string = options.cusPropName ?? 'stripe_id';
    const email: string = options.email ?? 'email';
    const currency: string = options.currency;

    return function (object, propertyKey: string) {
        const factory: CashableFactory = new CashableFactory();
        Object.defineProperty(object, propertyKey, {
            configurable: false,
            get: function (this: { [name: string]: any }) {
                if (!this.hasOwnProperty(cusPropName)) {
                    throw new Error('Cashable property containing custoemr ID must be declared and defined with default value.')
                }
                return factory.generate.call(this, stripe, cusPropName, this[cusPropName], currency, email)
            },
            set: function (this: { [name: string]: any }) {
                if (!this.hasOwnProperty(cusPropName)) {
                    throw new Error('Cashable property containing custoemr ID must be declared and defined with default value.')
                }
                return factory.generate.call(this, stripe, cusPropName, this[cusPropName], currency, email)
            }
        });

        return object;
    }
}