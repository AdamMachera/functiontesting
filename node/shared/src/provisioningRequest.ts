interface ProvisioningRequest {
    machineName: string;
    size: string;
    cpuCount: number;
    requiredOrchestrators: string[];
}