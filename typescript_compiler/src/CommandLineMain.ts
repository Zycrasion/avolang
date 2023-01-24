import { readFile } from "fs/promises"
import * as path from "node:path"
import { OpenWebsite } from "./CommandUtils/WebsiteOpener.js";
import { RunAvo } from "./Interpreter/Interpreter.js";
import { Parser } from "./Parser/Parser.js";
import { Tokenise } from "./Tokeniser/Tokeniser.js";
import * as process from "process"; 
const encoding : BufferEncoding = "utf8";

async function RunFile()
{
    if (process.argv.length < 3)
    {
        throw new Error("File not specified");
    }
    let file = process.argv[3];
    let content = await readFile(path.resolve(file), {encoding});
    let tokens = Tokenise(content);
    let nodes = new Parser(tokens).read();
    RunAvo(nodes);
}

function Help()
{
    let padding = "=".repeat(15);
    console.log(padding, `( AVO HELP )`, padding)
    console.log(`\tavo help\n\t\tbrings up this menu`);
    console.log(`\tavo run [file]\n\t\truns the interpreter`);
    console.log(`\tavo web\n\t\topens up the homepage`);
}

if (process.argv.length == 2)
{
    console.log("No operations specified, defualting to Help Menu.")
    Help();
    process.exit(1);
}

let operation = process.argv[2];

switch(operation)
{
    case "run":
        RunFile();
        break;
    
    case "web":
        OpenWebsite("https://github.com/Zycrasion/avolang")
        break;

    case "help":
        Help();
        break;

    default:
        console.log("Invalid Operation ".concat(operation))
        break;
}