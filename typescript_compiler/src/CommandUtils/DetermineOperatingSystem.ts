import * as process from "process";

export enum SupportedSystems
{
    LINUX,
    MACOS,
    WINDOWS,
    UNSUPPORTED
}

export function DetermineOS() : SupportedSystems
{
    // TODO: Detect WSL if possible
    let os_raw = process.platform;
    let os : SupportedSystems = SupportedSystems.UNSUPPORTED;

    if (os_raw == "win32")
    {
        os = SupportedSystems.WINDOWS;
    }

    if (os_raw == "darwin")
    {
        os = SupportedSystems.MACOS;
    }

    if (os_raw == "linux")
    {
        os = SupportedSystems.LINUX;
    }

    return os;

}