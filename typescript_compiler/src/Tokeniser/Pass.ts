import { IToken } from "./TokenTypes";

export interface TokeniserPass
{
    result : IToken[];
    Run() : IToken[];
}