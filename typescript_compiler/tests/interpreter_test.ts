import { RunAvo } from "../src/Interpreter/Interpreter.js"
import { Tokenise } from "../src/Tokeniser/Tokeniser.js";
import { Parser } from "../src/Parser/Parser.js";
import { HasValue } from "../src/Tokeniser/TokenTypes.js";

import { writeFile } from "fs/promises";

function repeat(times: number, str: string | number): string
{
    let finalStr: string = "";
    for (let index: number = 0; index < times; index++) // loop over for the amount of times times specifies
    {
        finalStr += str.toString(); // add str to final string
    }
    return finalStr; // return it
}


async function main()
{
    let tokens = Tokenise(`
    {
        var:int a = 10
        {
            var:int a = 20
            io.println(a)
        }
        io.println(a)
    }

    `);
    await writeFile("tokens.json", JSON.stringify(tokens))

    let tree = new Parser(tokens);
    let nodes = tree.read();
    await writeFile("tree.json", JSON.stringify(nodes));

    RunAvo(nodes);

    // console.log(repeat(50, "=").concat("FINISHED PROGRAM").concat(repeat(50, "=")))
    // console.log(JSON.stringify(nodes));
    // console.log(JSON.stringify(scope))
}

main();