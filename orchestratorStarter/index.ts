import * as df from "durable-functions"
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { IHttpResponse } from "durable-functions/lib/src/classes";

const orchestratorStarter: AzureFunction = async function (context: Context, req: HttpRequest): Promise<any> {
    const client = df.getClient(context);
    const instanceId = await client.startNew(req.params.functionName, undefined, req.body);

    context.log(`Started orchestration ${req.params.functionName} with ID = '${instanceId}'.`);

    const response: IHttpResponse = client.createCheckStatusResponse(context.bindingData.req, instanceId);
    var urls = response.body as MonitoringStatusUrls;

    const monitoringInstanceId = await client.startNew("orchestratorStateUpdater", undefined, urls);
    context.bindings.outputQueue = urls;
    return response;
};

export default orchestratorStarter;
