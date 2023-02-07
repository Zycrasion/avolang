import { GroupRelatedPass } from "./GroupRelatedPass.js";
import { PolishNotationPass } from "./PolishNotationPass.js";
import { StringPass } from "./StringPass.js";

export function Tokenise(content : string)
{
    let Pass1 = new StringPass(content);
    
    let Pass2 = new GroupRelatedPass(Pass1.result);

    let Finished = new PolishNotationPass(Pass2.result);

    return Finished.result;
}