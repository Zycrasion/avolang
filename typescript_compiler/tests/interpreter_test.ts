import { AvoFunction, Scope } from "../src/Interpreter.js";
import { Tokenise } from "../src/Tokeniser/Tokeniser.js";
import { Parser } from "../src/Parser/Parser.js";

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
    let tokens = Tokenise(`
    var:int random_variable = rand.randint(5);
    out.print("TESTING POLISH NOTATION");
    out.print(3 * 2 + 1 / 2); * 3 + 2 / 1 2
    out.print(random_variable * 2, random_variable);
    out.print(rand.randint(5) * 2, 2 * rand.randint(10))
    `);
    // console.log(JSON.stringify(tokens));

    let tree = new Parser(tokens);
    let nodes = tree.read();
    console.log(JSON.stringify(nodes));
    return;
    let scope = new Scope(nodes);

    scope.functions["out.print"] = new AvoFunction((...a: any) =>
    {
        console.log(a.join(" "))
    }, "Void", "Infinite")

    scope.functions["rand.randint"] = new AvoFunction((...a: any) =>
    {
        return Math.floor(Math.random() * a[0])
    }, "Int", 1)

    scope.functions["rand.randfloat"] = new AvoFunction((...a: any) =>
    {
        return Math.random() * a[0]
    }, "Float", 1)

    scope.walk();

    // console.log(repeat(50, "=").concat("FINISHED PROGRAM").concat(repeat(50, "=")))
    // console.log(JSON.stringify(nodes));
    // console.log(JSON.stringify(scope))
}

main();