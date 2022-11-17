import { AvoFunction, Scope } from "../src/Interpreter.js";
import { Tokeniser, Parser } from "../src/Parser.js";
function repeat(times : number, str : string | number) : string
{
    let finalStr : string = ""; 
    for (let index : number = 0; index < times; index++) // loop over for the amount of times times specifies
    {
        finalStr += str.toString(); // add str to final string
    }
    return finalStr; // return it
}


function main()
{
    let token = new Tokeniser(`
    var:int a = 1;
    var:float b = 1.0;
    var:int c = a * 2;
    var:bool d = true;
    out.print(c);
    `);
    let tokens = token.read();

    let tree = new Parser(tokens);
    let nodes = tree.read();
    let scope = new Scope(nodes);
    scope.functions["out.print"] = new AvoFunction((...a : any) => {
        console.log(a.join(" "))
    }, "Void")
    scope.walk();
    // console.log(JSON.stringify(scope))
}

main();