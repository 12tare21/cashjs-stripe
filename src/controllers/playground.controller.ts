import { Controller, Get } from '@nestjs/common';
import { Cashable } from 'src/decorators/cashable';
import  Stripe  from 'stripe';
import { readFileSync } from 'fs';

class CashableEntity{
    // ...
    
    @Cashable(
        new Stripe(getEnvObject()['STRIPE_SECRET_KEY'], {apiVersion: '2020-08-27'}),
        {
            currency: getEnvObject()['CASHJS_CURRENCY'] // set default currency used for cashjs methods
        }  
    ) 
    public stripe: any; // Decorated property with common stripe API-s and CashJS custom methods
    public stripe_id: string = null; // Customer id property
    
    // ...
}

@Controller()
export class PlaygroundController {
  @Get('/test')
  async test(): Promise<any> {
    const useCaseRes: any = {};

    // Create stripe customer on cashable entity instance
    const user: CashableEntity = new CashableEntity();  
    await user.stripe.createStripeCustomer();
    let customer = await user.stripe.asStripeCustomer();
    useCaseRes['created_stripe_customer'] = customer;

    // Manage paymenet methods for customer
    const paymentMethod: any = await user.stripe.addPaymentMethod({
        type: 'card',
        card: {
            number: '4242424242424242',
            exp_month: 1,
            exp_year: 2022,
            cvc: '314',
        },
    });

    useCaseRes.has_payment_method = await user.stripe.hasPaymentMethod(paymentMethod.id);
    useCaseRes.defualt_method_autoset_retrieve = await user.stripe.defaultPaymentMethod();

    const paymentMethod2: any = await user.stripe.addPaymentMethod({
        type: 'card',
        card: {
            number: '4242424242424242',
            exp_month: 1,
            exp_year: 2022,
            cvc: '314',
        },
    });
    await user.stripe.setDefaultPaymentMethod(paymentMethod2.id);
    useCaseRes.all_payment_methods = await user.stripe.paymentMethods({type: 'card'});

    // Create payment intent, pay it and refund it
    useCaseRes.charged_400 = await user.stripe.charge(400);
    useCaseRes.refund_400 = await user.stripe.refund(useCaseRes.charged_400.id);

    // Invoice user for given item
    useCaseRes.invoice_for_350 = await user.stripe.invoiceFor('cashjs-invoice-item', 350);

    // Fill balance with balance transaction
    useCaseRes.balance_filled_500 = await user.stripe.fillBallance(500);

    useCaseRes.removed_customer = await user.stripe.removeStripeCustomer();

    return useCaseRes;
  }
}

export function getEnvObject(): Object{
    const envObject: Object = {};
    const env: string = readFileSync('.env', {encoding: 'utf-8'});
    env.split('\n').forEach((variable) => {
        let variableKeyValue = variable.split('='); 
        envObject[variableKeyValue[0]] = variableKeyValue[1];
    });

    return envObject;
}
