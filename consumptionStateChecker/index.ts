import * as df from "durable-functions"
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Consts } from "../shared/src/consts"

const getStateFunction: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('getStateFunction');
    const subscriptionName = req.query.subscriptionName;
    
    if (subscriptionName) {
        const client = df.getClient(context);
        const entityId = new df.EntityId(Consts.ConsumptionActorName, subscriptionName);
        const stateResponse = await client.readEntityState(entityId);
        if (stateResponse && stateResponse.entityExists)
        {
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: stateResponse.entityState
            };
        }
        else
        {
            context.res = {
                status: 404,
                body: `State for subscription ${subscriptionName} not found.`
            };

        }
    }
    else {
        context.res = {
            status: 400,
            body: "Subscription not found."
        };
    }
};

export default getStateFunction;