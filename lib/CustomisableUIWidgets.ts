export enum CustomisableUIWidgetDisplay {
    Icons = "icons",
    Text = "text",
    IconsAndText = "icons_and_text",
    IconsBesideText = "icons_beside_text",
}

export enum CustomisableUIWidgetSource {
    BuiltIn = "builtin",
    External = "external",
}

export type CustomisableUIWidgetConfigurationTypes =
    | "string"
    | "boolean"
    | "number";
