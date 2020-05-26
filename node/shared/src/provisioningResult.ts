export interface ProvisioningResult {
    isSuccess: boolean;
    message: string;
    results: OrchestrationResult[];
    addResults(result: OrchestrationResult): void;
    setStatus(isSuccess: boolean, message: string): void;
}