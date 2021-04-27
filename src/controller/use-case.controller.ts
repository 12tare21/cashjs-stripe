import { Controller, Get } from '@nestjs/common';
import { User } from 'src/model/User';

@Controller('/test')
export class UseCaseController {
    @Get('/')
    async test(): Promise<any> {
        const useCases: any = {};
        // Create stripe customer on cashable entity instance

        const user: User = new User();
        await user.stripe.createStripeCustomer();

        let customer = await user.stripe.asStripeCustomer();
        useCases.createdStripeCustomer = customer;

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

        useCases.hasPaymentMethod = await user.stripe.hasPaymentMethod(paymentMethod.id);
        useCases.defualtMethodAutosetRetrieve = await user.stripe.defaultPaymentMethod();

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
        useCases.allPaymentMethods = await user.stripe.paymentMethods({ type: 'card' });

        // Create payment intent, pay it and refund it
        useCases.charged400 = await user.stripe.charge(400);
        useCases.refund400 = await user.stripe.refund(useCases.charged400.id);

        // Invoice user for given item
        useCases.invoiceFor350 = await user.stripe.invoiceFor('cashjs-invoice-item', 350);

        // Fill balance with balance transaction
        useCases.balanceFilled500 = await user.stripe.fillBalance(500);

        useCases.removedCustomer = await user.stripe.removeStripeCustomer();

        return useCases;
    }
}