import * as df from "durable-functions"
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Consts } from "../shared/src/consts"

const consumptionStateSetter: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const name = req.body && req.body.subscriptionName;
    const value = req.body && req.body.value;
    if (name) {
        const client = df.getClient(context);
        const entityId: df.EntityId = new df.EntityId(Consts.ConsumptionActorName, name);
        await client.signalEntity(entityId, Consts.AddOperation, value);
        context.res = {
            body: "success"
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Pass subscriptionName in the body"
        };
    }
};

export default consumptionStateSetter;
