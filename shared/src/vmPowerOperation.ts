interface VmPowerOperation {
    subscriptionId: string;
    resourceGroup: string;
    name: string;
    operation: string;
    apiVersion?: string;
    skipShutdown?: boolean;
}