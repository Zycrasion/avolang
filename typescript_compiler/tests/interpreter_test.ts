import { Scope } from "../src/Interpreter.js";
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
    var:int c = a;
    var:bool d = true;
    `);
    let tokens = token.read();

    let tree = new Parser(tokens);
    let nodes = tree.read();

    let scope = new Scope(nodes);
    scope.walk();
    console.log(JSON.stringify(scope))
}

main();