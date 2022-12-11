import { applyWidgetConfiguration } from "..";
import ToolbarButtonWidget from "../common/toolbar-button";

class BackButtonWidget extends ToolbarButtonWidget {
    public configure(options: Partial<this>) {
        applyWidgetConfiguration(
            this,
            {
                visible: ["boolean"],
            },
            options
        );
    }

    public constructor() {
        super({
            id: "back-button",
            text: "Go Back",
            icon: "chrome://dot/skin/icons/back.svg",
        });

        // Use browser event emitter to listen for changes to
        // navigation state then apply this.disabled as necessary.
    }
}

export default BackButtonWidget;
