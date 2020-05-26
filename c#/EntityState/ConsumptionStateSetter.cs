using EntityState.Services;
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
    public class ConsumptionStateSetter
    {
        private readonly ISimpleValueValidator simpleValueValidator;

        public ConsumptionStateSetter(ISimpleValueValidator simpleValueValidator)
        {
            this.simpleValueValidator = simpleValueValidator;
        }

        [FunctionName(nameof(ConsumptionStateSetter))]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            [DurableClient] IDurableEntityClient durableClient,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            using (StreamReader reader = new StreamReader(req.Body))
            {
                var content = await reader.ReadToEndAsync();
                var data = JObject.Parse(content);
                if (int.TryParse(data["value"].ToString(), out int value))
                {
                    if (!this.simpleValueValidator.Validate(value))
                    {
                        return new BadRequestObjectResult(new { msg = "value must be smaller than 1000" });
                    }

                    var subscriptionName = data["subscriptionName"].ToString();
                    var entityId = new EntityId(Consts.ConsumptionActorName, subscriptionName);
                    await durableClient.SignalEntityAsync(entityId, Consts.AddOperation, value);
                    return new OkResult();
                }
            }

            return new BadRequestResult();
        }
    }
}
