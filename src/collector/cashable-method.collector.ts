import { BalanceTransactionMethodFactory } from '../factory/balance-transaction.method-factory';
import { CashjsMethodFactory } from '../factory/cashjs.method-factory';
import { ChargeMethodFactory } from '../factory/charge.method-factory';
import { InvoiceMethodFactory } from '../factory/invoice.method-factory';
import { InvoiceItemMethodFactory } from '../factory/invoice-item.method-factory';
import { PaymentIntentMethodFactory } from '../factory/payment-intent.method-factory';
import { PaymentMethodMethodFactory } from '../factory/payment-method.method-factory';
import { SourceMethodFactory } from '../factory/source.method-factory';
import Stripe from 'stripe';

export class CashableMethodCollector {
    public buildMethods(stripe: Stripe, customerIdAlias: string, customerId: string, currency: string, email: string) {
        const balanceTransactionMethodFactory = new BalanceTransactionMethodFactory();
        const cashjsMethodFactory = new CashjsMethodFactory();
        const chargeMethodFactory = new ChargeMethodFactory();
        const invoiceMethodFactory = new InvoiceMethodFactory();
        const invoiceItemMethodFactory = new InvoiceItemMethodFactory();
        const paymentIntentMethodFactory = new PaymentIntentMethodFactory();
        const paymentMethodMethodFactory = new PaymentMethodMethodFactory();
        const sourceMethodFactory = new SourceMethodFactory();

        return {
            ...cashjsMethodFactory.generate.call(this, stripe, customerIdAlias, customerId, currency, email),
            _intents: paymentIntentMethodFactory.generate.call(this, stripe, customerId),
            _charges: chargeMethodFactory.generate.call(this, stripe, customerId),
            _invoices: invoiceMethodFactory.generate.call(this, stripe, customerId),
            _invoiceItems: invoiceItemMethodFactory.generate.call(this, stripe, customerId),
            _balacneTransactions: balanceTransactionMethodFactory.generate.call(this, stripe, customerId),
            _sources: sourceMethodFactory.generate.call(this, stripe, customerId),
            _paymentMethods: paymentMethodMethodFactory.generate.call(this, stripe, customerId),
        }
    }
}