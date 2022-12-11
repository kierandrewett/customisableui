import Widget from ".";
import { CustomisableUIWidgetDisplay } from "../../CustomisableUIWidgets";

class ItemListWidget extends Widget {
    public constructor() {
        super({
            visible: true,
            display: CustomisableUIWidgetDisplay.IconsBesideText,
        });
    }
}

export default ItemListWidget;
