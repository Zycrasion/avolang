import { RunAvo } from "../src/Interpreter/Interpreter.js"
import { Tokenise } from "../src/Tokeniser/Tokeniser.js";
import { Parser } from "../src/Parser/Parser.js";
import { HasValue } from "../src/Tokeniser/TokenTypes.js";

import { writeFile } from "node:fs/promises";

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
    {
        var:int a = 10;
    }
    var:int b = a * 2;
    var:int random_variable = rand.randint(5);
    io.println("TESTING POLISH NOTATION");
    io.println(3 * 2 + 1 / 2);
    io.println(random_variable );
    io.println(rand.randint(5) * 2)
    `);
    let tree = new Parser(tokens);
    let nodes = tree.read();
    writeFile("tree.json", JSON.stringify(nodes));

    RunAvo(nodes);

    // console.log(repeat(50, "=").concat("FINISHED PROGRAM").concat(repeat(50, "=")))
    // console.log(JSON.stringify(nodes));
    // console.log(JSON.stringify(scope))
}

main();