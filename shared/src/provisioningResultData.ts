import { ProvisioningResult } from "./provisioningResult";
export class ProvisioningResultData implements ProvisioningResult {
    isSuccess: boolean;
    message: string;
    results: OrchestrationResult[] = [];
    public addResults(result: OrchestrationResult) {
        this.results.push(result);
    }
    public setStatus(isSuccess: boolean, message: string) {
        this.isSuccess = isSuccess;
        this.message = message;
    }
}
