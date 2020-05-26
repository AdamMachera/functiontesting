import * as df from "durable-functions"
import { IEntityFunctionContext } from "durable-functions/lib/src/classes";
import { Consts } from "../shared/src/consts"

const consumptionStateActor = df.entity(async function(context: IEntityFunctionContext) {
    let currentValue: any = context.df.getState(() => 0);
    
    switch (context.df.operationName) {
        case Consts.AddOperation:
            let value: any = context.df.getInput();
            context.df.setState(currentValue + value);
            break;
        case Consts.GetOperation:
            context.df.return(currentValue);
            break;
    }
});

export default consumptionStateActor;