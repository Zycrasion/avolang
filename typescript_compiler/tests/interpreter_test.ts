import { AvoFunction, Scope } from "../src/Interpreter.js";
import { Tokeniser } from "../src/Tokeniser.js";
import { Parser } from "../src/Parser.js";

function repeat(times: number, str: string | number): string
{
    let finalStr: string = "";
    for (let index: number = 0; index < times; index++) // loop over for the amount of times times specifies
    {
        finalStr += str.toString(); // add str to final string
    }
    return finalStr; // return it
}


function main()
{
    let token = new Tokeniser(`
    var:int random_variable = rand.randint(5 + 5);
    var:float random_float = rand.randfloat(100);
    out.print(2, random_variable, random_float);
    `);
    let tokens = token.read();

    let tree = new Parser(tokens);
    let nodes = tree.read();

    let scope = new Scope(nodes);


    scope.functions["out.print"] = new AvoFunction((...a: any) =>
    {
        console.log(a.join(" "))
    }, "Void")

    scope.functions["rand.randint"] = new AvoFunction((...a: any) =>
    {
        return Math.floor(Math.random() * a[0])
    }, "Int")

    scope.functions["rand.randfloat"] = new AvoFunction((...a: any) =>
    {
        return Math.random() * a[0]
    }, "Float")

    scope.walk();

    console.log(repeat(50, "=").concat("FINISHED PROGRAM").concat(repeat(50, "=")))
    console.log(JSON.stringify(nodes));
    console.log(JSON.stringify(scope))
}

main();