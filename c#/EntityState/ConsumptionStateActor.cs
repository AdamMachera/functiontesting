using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;

namespace EntityState
{
    public static class ConsumptionStateActor
    {
        [FunctionName(Consts.ConsumptionActorName)]
        public static void Run([EntityTrigger] IDurableEntityContext ctx)
        {
            switch (ctx.OperationName.ToLowerInvariant())
            {
                case Consts.AddOperation:
                    var currentState = ctx.GetState<int>();
                    currentState += ctx.GetInput<int>();
                    ctx.SetState(currentState);
                    break;
                case Consts.GetOperation:
                    ctx.Return(ctx.GetState<int>());
                    break;
            }
        }
    }
}
