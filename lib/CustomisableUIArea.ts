export enum CustomisableUIAreaType {
    Panel = "panel",
}

export enum CustomisableUIContextType {
    Root = "root",
    Panel = "panel",
    Sidebar = "sidebar",
    Frame = "frame",
}

export interface CustomisableUIArea {
    /**
     * Type of area to create
     */
    type: CustomisableUIAreaType;

    /**
     * ID of an overflow button to put overflowed items into
     */
    anchor: string;

    /**
     * An array of widget IDs to be placed in the area by default
     */
    defaultPlacements: string[];
}
