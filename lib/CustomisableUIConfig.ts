import { CustomisableUIArea } from "./CustomisableUIArea";
import { CustomisableUIPlacement } from "./CustomisableUIPlacement";

export interface CustomisableUISerialisedConfiguration {
    placements: Record<string, CustomisableUIPlacement[]>;
    areas: Record<string, CustomisableUIArea>;
    seen: {}; // This is currently unused in Dot Browser.
    dirtyAreaCache: {}; // This is currently unused in Dot Browser.
    currentVersion: number;
    newElementCount: number; // This is currently unused in Dot Browser.
}
