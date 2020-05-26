import * as df from "durable-functions"
import { ProvisioningResultData } from "../shared/src/provisioningResultData";

const processOrchestrator = df.orchestrator(function* (context) {
    context.log.info("process Orchestrator starting");
    const incomingData: any = context.df.getInput();
    const provisioningData: ProvisioningRequest = incomingData as ProvisioningRequest;
    var result: ProvisioningResultData = new ProvisioningResultData();
    var executedOrchestrationsCounter = 0;
    if (provisioningData) {
        for (let orchestration of provisioningData.requiredOrchestrators) {
            const response: OrchestrationResult = yield context.df.callSubOrchestrator(orchestration, provisioningData);
            result.addResults(response);
            executedOrchestrationsCounter++;
            if (response.isSuccess === false) {
                result.setStatus(false, `Orchestrator failed on step ${orchestration}`)
                return result;
            }
        }

        if (executedOrchestrationsCounter == provisioningData.requiredOrchestrators.length) {
            result.setStatus(true, `all ${provisioningData.requiredOrchestrators.length} orchestrators were executed successfully`);
            return result;
        }
    }
    else {
        result.setStatus(false, `Unable to parse data ${incomingData}`);
        return result;
    }
});

export default processOrchestrator;
