// All avo standard functions

import { FunctionBuilder } from "./FunctionCallHandler.js";
import { Scope } from "./Interpreter.js";
import { readFile } from "fs/promises"
let { version } = JSON.parse(await readFile("package.json", {encoding : "utf-8"}))

let StandardScope: Scope = {
    Functions: {
        "avo.version": FunctionBuilder(
            (a: any) =>
            {
                return version
            },
            0,
            "String"
        ),
        "io.println": FunctionBuilder(
            (a: any) =>
            {
                process.stdout.write(a + "\n")
            },
            1,
            "Void"
        ),
        "io.print": FunctionBuilder(
            (a : any) =>
            {
                process.stdout.write(a)
            },
            1,
            "Void"
        ),
        "rand.randint": FunctionBuilder(
            (a : number) => {
                return Math.floor(Math.random() * (a + 1));
            },
            1,
            "Int"
        )
    },
    Variables: {
        "avo.engine":
        {
            "type" : "String",
            "value" : "Typescript"
        },
        "avo.engine.version":
        {
            "type" : "String",
            "value" : (JSON.parse(await readFile("package.json", {encoding : "utf-8"})) as {version : string}).version
        }
    }
}

export default StandardScope;