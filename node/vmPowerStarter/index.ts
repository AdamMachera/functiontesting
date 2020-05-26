import * as df from "durable-functions"
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const vmPowerStarter: AzureFunction = async function (context: Context, req: HttpRequest): Promise<any> {
    const client = df.getClient(context);
    const instanceId = await client.startNew("vmPowerOrchestrator", undefined, req.body);
    context.log(`Started vmPowerOrchestrator with ID = '${instanceId}'.`);
    return client.createCheckStatusResponse(context.bindingData.req, instanceId);
};

export default vmPowerStarter;
