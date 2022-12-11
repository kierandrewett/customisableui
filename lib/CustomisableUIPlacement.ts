import { CustomisableUIBaseEntity } from "./CustomisableUI";

export interface CustomisableUIPlacementProperties
    extends CustomisableUIBaseEntity {}

export type CustomisableUIPlacement =
    | [string]
    | [string, CustomisableUIPlacementProperties];
