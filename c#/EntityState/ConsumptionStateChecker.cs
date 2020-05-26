using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Threading.Tasks;

namespace EntityState
{
    public static class ConsumptionStateChecker
    {
        [FunctionName(nameof(ConsumptionStateChecker))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = null)] HttpRequest req,
            [DurableClient] IDurableEntityClient durableClient,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            var actorId = req.Query["subscriptionName"];
            var entityId = new EntityId(Consts.ConsumptionActorName, actorId);
            var state = await durableClient.ReadEntityStateAsync<JValue>(entityId);
            if (!state.EntityExists)
            {
                return new NotFoundResult();
            }

            return new OkObjectResult(state.EntityState);
        }
    }
}
