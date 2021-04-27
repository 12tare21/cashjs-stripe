import Stripe from 'stripe';
import { validCustomer } from './common.methods';

export class BalanceTransactionMethodFactory {
    public generate(stripe: Stripe, customerId: string) {
        return {
            createCustomerBalanceTransaction: async (options: Stripe.CustomerBalanceTransactionCreateParams): Promise<Stripe.CustomerBalanceTransaction> => {
                return stripe.customers.createBalanceTransaction((await validCustomer(stripe, customerId)).id, options);
            },
            retrieveCustomerBalanceTransaction: async (transaction_id: string, options: Stripe.CustomerBalanceTransactionRetrieveParams): Promise<Stripe.CustomerBalanceTransaction> => {
                return stripe.customers.retrieveBalanceTransaction((await validCustomer(stripe, customerId)).id, transaction_id, options);
            },
            updateCustomerBalanceTransaction: async (transaction_id: string, options: Stripe.CustomerBalanceTransactionUpdateParams): Promise<Stripe.CustomerBalanceTransaction> => {
                return stripe.customers.updateBalanceTransaction((await validCustomer(stripe, customerId)).id, transaction_id, options);
            },
            listCustomerBalanceTransaction: async (options: Stripe.CustomerBalanceTransactionListParams): Promise<Stripe.ApiListPromise<Stripe.CustomerBalanceTransaction>> => {
                return stripe.customers.listBalanceTransactions((await validCustomer(stripe, customerId)).id, options);
            },
        };
    }
}
