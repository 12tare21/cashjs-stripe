import { readFileSync } from "fs";
import Stripe from "stripe";
import { Cashable } from "../decorator/cashable";

const stripe: Stripe = new Stripe(getEnvObject()['STRIPE_SECRET_KEY'], { apiVersion: '2020-08-27' });

export class User {
    @Cashable(
        stripe, { currency: getEnvObject()['CASHJS_CURRENCY'] }
    ) public stripe: any; // Decorated property with common stripe API-s and CashJS custom methods

    public stripeId: string = null; // Customer id property
    public email: string = "example@test.com"; // Will be used as customer email for Stripe API calls
}

export function getEnvObject(): Object {
    const envObject: Object = {};
    const env: string = readFileSync('.env', { encoding: 'utf-8' });

    env.split('\n').forEach((envVariable) => {
        let envVariableElements = envVariable.split('=', 2);
        envObject[envVariableElements[0]] = envVariableElements[1];
    });

    return envObject;
}