import * as df from "durable-functions"
import * as moment from 'moment';

const provisionVmOrchestrator = df.orchestrator(function* (context) {
    const data = context.df.getInput();
    context.log.info(`Start provisionVmOrchestrator data: ${data}`);

    var counter: number = 0;
    var finished: boolean = false;
    while (counter < 2) {
        counter = counter + 1;
        const nextCheck = moment.utc(context.df.currentUtcDateTime).add(5, 's');
        yield context.df.createTimer(nextCheck.toDate());
    }

    finished = true;

    var extraMessage = { extra: 123 };
    var result: OrchestrationResult = 
        { orchestrator: "provisionVmOrchestrator", isSuccess: true, output: extraMessage };
    return result;
});

export default provisionVmOrchestrator;
