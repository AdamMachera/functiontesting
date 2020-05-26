import * as df from "durable-functions"
import * as moment from "moment"
import { DurableOrchestrationStatus } from "durable-functions/lib/src/classes";

const orchestratorStateUpdater = df.orchestrator(function* (context) {
    const input = context.df.getInput() as MonitoringStatusUrls;
    context.log.info(`monitoring if orchestration of VM was finished: ${input} isReplying: ${context.df.isReplaying}`);
    const endTime = moment.utc(context.df.currentUtcDateTime).add(2, 'h');
    while (moment.utc(context.df.currentUtcDateTime).isBefore(endTime)) {
        // const reply: DurableOrchestrationStatus = yield context.df.callActivity("orchestratorStateChecker", input.id);
        const data: any = yield context.df.callHttp("GET", input.statusQueryGetUri);
        const orchestrationStatus: DurableOrchestrationStatus = JSON.parse(data.content) as DurableOrchestrationStatus;
        if (orchestrationStatus.runtimeStatus === "Completed" ||  orchestrationStatus.runtimeStatus === "Failed" ||  orchestrationStatus.runtimeStatus === "Canceled" || orchestrationStatus.runtimeStatus === "Terminated") {
            context.log(`monitoring of VM has been finished: ${input.id} ${input.statusQueryGetUri} with status: ${orchestrationStatus.runtimeStatus}`)
            break;
        }
        else {
            var nextCheckpoint = moment.utc(context.df.currentUtcDateTime).add(30, 's');
            yield context.df.createTimer(nextCheckpoint.toDate());
        }
    }
});

export default orchestratorStateUpdater;
