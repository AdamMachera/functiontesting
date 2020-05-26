import * as df from "durable-functions"
import * as moment from 'moment';

const restartVmOrchestrator = df.orchestrator(function* (context) {
    const data: VmPowerOperation = context.df.getInput() as VmPowerOperation;
    context.log.info(`Restart VM: ${data.name}`);
    const apiVersion = data.apiVersion ?? "2019-03-01";
    const tokenSource = new df.ManagedIdentityTokenSource("https://management.core.windows.net");
    
    let apiUrl: string = `https://management.azure.com/subscriptions/${data.subscriptionId}/resourceGroups/${data.resourceGroup}/providers/Microsoft.Compute/virtualMachines/${data.name}/${data.operation}?api-version=${apiVersion}`;
    if (data.skipShutdown != null) {
        apiUrl += `&skipShutdown=${data.skipShutdown}` 
    }

    const restartResponse = yield context.df.callHttp(
        "POST",
        apiUrl,
        undefined, 
        undefined,
        tokenSource);

    if (restartResponse.statusCode === 202) {
        const location: string = restartResponse.headers.Location;
        const endTime = moment.utc(context.df.currentUtcDateTime).add(2, 'h');
        while (moment.utc(context.df.currentUtcDateTime).isBefore(endTime)) {
            
            const tokenSourceForStatusUpdate = new df.ManagedIdentityTokenSource("https://management.core.windows.net");
            const statusRestartResponse: any = yield context.df.callHttp("GET", location, undefined, undefined, tokenSourceForStatusUpdate);
            if (statusRestartResponse.statusCode === 202) {
                var nextCheckpoint = moment.utc(context.df.currentUtcDateTime).add(30, 's');
                yield context.df.createTimer(nextCheckpoint.toDate());
            }
            else {
                if (statusRestartResponse.statusCode === 200) {
                    context.log.info(`successfully ${data.operation} vm: ${data.name}`)
                    var successResult: HttpResult = { isSuccess: true, message: `successfully ${data.operation} ${data.name}`, statusCode: statusRestartResponse.statusCode };
                    return successResult;
                }
                else {
                    var failedResults: HttpResult = { isSuccess: false, message: `unable to ${data.operation} ${data.name}`, statusCode: statusRestartResponse.statusCode };
                    return failedResults;
                }
            }
        }

        context.log.error(`Unable to get reply in 2h about ${data.operation} status for ${data.name}`);
        var failedAfterRetries: HttpResult = { isSuccess: false, message: `unable to ${data.operation} after retries ${data.name}`, statusCode: -1 };
        return failedAfterRetries;
    }
    else {
        context.log.error(`Failed to ${data.operation} vm: ${data.name} in resourceGroup: ${data.resourceGroup} statusCode: ${restartResponse.statusCode}`)
        var not202result: HttpResult = { isSuccess: false, message: restartResponse.content, statusCode: restartResponse.statusCode };
        return not202result;
    }
});

export default restartVmOrchestrator;
