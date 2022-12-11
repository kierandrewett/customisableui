import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import {
    CustomisableUIArea,
    CustomisableUIAreaType,
    CustomisableUIContextType,
} from "./CustomisableUIArea";
import { CustomisableUISerialisedConfiguration } from "./CustomisableUIConfig";
import { CustomisableUIPlacement } from "./CustomisableUIPlacement";
import { CustomisableUIWidgetSource } from "./CustomisableUIWidgets";
import { CustomizableWidgets } from "./widgets";
import Widget from "./widgets/common";

export interface CustomisableUIBaseEntity {
    /**
     * Determines whether the entity should be visible
     */
    visible: boolean;
}

class _CustomisableUIInternal {
    /**
     * The current version. We can use this to auto-add new default widgets as necessary.
     */
    private kVersion = 0;

    /**
     * Constant indicating the area is a panel.
     */
    public TYPE_PANEL = CustomisableUIAreaType.Panel;

    /**
     * Constant indicating the context is root.
     */
    public CONTEXT_ROOT = CustomisableUIContextType.Root;

    /**
     * Constant indicating the context is a panel.
     */
    public CONTEXT_PANEL = CustomisableUIContextType.Panel;

    /**
     * Constant indicating the context is a sidebar.
     */
    public CONTEXT_SIDEBAR = CustomisableUIContextType.Sidebar;

    /**
     * Constant indicating the context is a frame.
     */
    public CONTEXT_FRAME = CustomisableUIContextType.Frame;

    /**
     * Constant indicating the widget is built-in
     */
    public SOURCE_BUILTIN = CustomisableUIWidgetSource.BuiltIn;

    /**
     * Constant indicating the widget is externally provided
     * (e.g. by add-ons or other items not part of the builtin widget set).
     */
    public SOURCE_EXTERNAL = CustomisableUIWidgetSource.External;

    /**
     * A map of placements in the UI
     */
    private placements = new Map<string, CustomisableUIPlacement[]>();

    /**
     * A map of areas defined in the UI
     */
    private areas = new Map<string, CustomisableUIArea>();

    /**
     * An mapping of Firefox-only areas for the migration tool
     */
    private firefoxAreasMapping = {
        /**
         * Bookmarks bar
         */
        PersonalToolbar: (placementIds: string[]) => {},
        /**
         * Tabs bar
         */
        TabsToolbar: (placementIds: string[]) => {},
        /**
         * Navigation controls bar (back button, addressbar, etc.)
         */
        "nav-bar": (placementIds: string[]) => {},
        /**
         * Menu items bar (on Windows and Linux only)
         */
        "toolbar-menubar": (placementIds: string[]) => {
            // Do a platform check here to avoid migration on macOS
        },
        /**
         * Extensions in the extensions popout button
         */
        "unified-extensions-area": (placementIds: string[]) => {},
        /**
         * Widgets in the overflow list
         */
        "widget-overflow-fixed-list": (placementIds: string[]) => {},
    };

    /**
     * The cached UI state from disk.
     */
    private savedState!:
        | CustomisableUISerialisedConfiguration
        | Partial<CustomisableUISerialisedConfiguration>;

    /**
     * Start up CustomisableUI
     */
    public initialize() {
        console.debug("Initializing...");

        this.defineBuiltInWidgets();
        this.loadSavedState();
        this.migrateToNewVersion();
    }

    /**
     * Perform UI migrations
     */
    public migrateToNewVersion() {}

    /**
     * Define the built in widgets used in Dot Browser
     */
    private defineBuiltInWidgets() {
        for (const widgetDefinition of CustomizableWidgets) {
            this.createBuiltinWidget(widgetDefinition);
        }
    }

    /**
     * Create a built in widget
     */
    private createBuiltinWidget(data: Widget) {
        let widget = this.normalizeWidget(data, this.SOURCE_BUILTIN);
        if (!widget) {
            lazy.log.error("Error creating builtin widget: " + aData.id);
            return;
        }

        lazy.log.debug("Creating built-in widget with id: " + widget.id);
        gPalette.set(widget.id, widget);

        if (conditionalDestroyPromise) {
            conditionalDestroyPromise.then(
                (shouldDestroy) => {
                    if (shouldDestroy) {
                        this.destroyWidget(widget.id);
                        this.removeWidgetFromArea(widget.id);
                    }
                },
                (err) => {
                    Cu.reportError(err);
                }
            );
        }
    }

    public normalizeWidget(
        widget: Partial<Widget>,
        source: CustomisableUIWidgetSource
    ) {
        const widgetKeys = new Set(Object.keys(widget));

        const throwError = (...msg: any[]) => {
            console.error(msg);
            return null;
        };

        if (
            !widgetKeys.has("id") ||
            typeof widget.id != "string" ||
            !/^[a-z0-9-_]{1,}$/i.test(widget.id)
        ) {
            return throwError(
                "Given an illegal id in normalizeWidget",
                widget.id
            );
        }

        // todo: finish normalizeWidget
    }

    /**
     * Save the current state to disk
     */
    public saveState() {
        let state = {
            placements: new Map(this.placements),
            areas: new Map(this.areas),
            seen: new Set(), // This is currently unused in Dot Browser.
            dirtyAreaCache: new Set(), // This is currently unused in Dot Browser.
            currentVersion: this.kVersion,
            newElementCount: 0, // This is currently unused in Dot Browser.
        };

        if (this.savedState && this.savedState.placements) {
            for (let area of Object.keys(this.savedState.placements)) {
                if (!state.placements.has(area)) {
                    let placements = this.savedState.placements[area];
                    state.placements.set(area, placements);
                }
            }
        }

        console.debug("Saving state.");
        const serialized = JSON.stringify(state, this.serializerHelper);
        console.debug("State saved as: " + serialized);

        /* @todo: in final version this should be a setPreference call */
        writeFileSync(resolve(process.cwd(), "ui.json"), serialized);
    }

    /**
     * Serializes UI state into hygenic JSON
     */
    public serializerHelper(key: string, value: any) {
        if (typeof value == "object" && value.constructor.name == "Map") {
            let result: any = {};
            for (let [mapKey, mapValue] of value) {
                result[mapKey] = mapValue;
            }
            return result;
        }

        if (typeof value == "object" && value.constructor.name == "Set") {
            return [...value];
        }

        return value;
    }

    /**
     * Load the saved state from disk
     */
    public loadSavedState() {
        /* @todo: in final version this should be a getPreference call */
        let state = readFileSync(resolve(process.cwd(), "ui.json"), "utf-8");

        if (!state) return;

        try {
            this.savedState = JSON.parse(state);

            if (
                typeof this.savedState != "object" ||
                this.savedState === null
            ) {
                throw new Error("Invalid saved state");
            }
        } catch (e) {
            /* @todo: in final version this should be a clearPreference call */
            writeFileSync(resolve(process.cwd(), "ui.json"), "");

            this.savedState = {};
            console.debug(
                "Error loading saved UI customization state, falling back to defaults."
            );
        }

        if (!("placements" in this.savedState)) {
            this.savedState.placements = {};
        }

        if (!("areas" in this.savedState)) {
            this.savedState.areas = {};
        }

        if (!("currentVersion" in this.savedState)) {
            this.savedState.currentVersion = 0;
        }
    }
}

const CustomisableUIInternal = new _CustomisableUIInternal();

class _CustomisableUI {}

const CustomisableUI = new _CustomisableUI();

export default CustomisableUI;
