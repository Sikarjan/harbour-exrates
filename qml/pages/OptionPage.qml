import QtQuick 2.0
import Sailfish.Silica 1.0

Page {
    id: page

    // The effective value will be restricted by ApplicationWindow.allowedOrientations
    allowedOrientations: Orientation.All

    Column {
        anchors.fill: parent
        x: Theme.horizontalPageMargin
        width: parent.width -2*x

        PageHeader {
            title: qsTr("App Settings")
        }

        VerticalScrollDecorator {}

        ComboBox {
            width: parent.width
            label: qsTr("Source")

            menu: ContextMenu {
                MenuItem { text: "exchangerate-api.com" }
            }
        }
    }
}
