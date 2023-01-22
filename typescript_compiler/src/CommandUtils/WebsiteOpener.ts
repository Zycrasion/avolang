import { DetermineOS, SupportedSystems } from "./DetermineOperatingSystem.js";

import * as child from "child_process"

export function OpenWebsite(website : string)
{
    let system = DetermineOS();

    if (system == SupportedSystems.WINDOWS)
    {
        child.exec(`start ${website}`)
        return;
    }

    if (system == SupportedSystems.MACOS)
    {
        child.exec(`open ${website}`);
        return;
    }

    if (system == SupportedSystems.LINUX)
    {
        child.exec(`xdg-open ${website}`);
        return;
    }
}