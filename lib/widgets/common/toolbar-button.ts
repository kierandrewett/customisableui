import Widget from ".";
import { applyConfig } from "..";
import { CustomisableUIWidgetDisplay } from "../../CustomisableUIWidgets";

class ToolbarButtonWidget extends Widget {
    /**
     * Icon URI to use for ToolbarButton
     */
    public icon: string = "";

    /**
     * Text to use for ToolbarButton
     */
    public text: string = "";

    /**
     * Tooltip text to use for ToolbarButton
     */
    public tooltipText: string = "";

    /**
     * Keybind to use to run command of ToolbarButton
     */
    public keybind: string = "";

    public constructor(widget?: Partial<ToolbarButtonWidget>) {
        super({
            visible: true,
            display: CustomisableUIWidgetDisplay.Icons,
        });

        applyConfig(this, widget);
    }
}

export default ToolbarButtonWidget;
