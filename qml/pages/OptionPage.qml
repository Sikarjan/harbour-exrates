import QtQuick 2.0
import Sailfish.Silica 1.0
import QtQuick.LocalStorage 2.0
import "../js/parser.js" as Parser

Page {
    id: page

    Component.onCompleted: {
        source.currentIndex = rateModel.source
        updateCTL.checked = rateModel.updateConvertToList
    }

    // The effective value will be restricted by ApplicationWindow.allowedOrientations
    allowedOrientations: Orientation.All

    Column {
        anchors.fill: parent
        x: Theme.horizontalPageMargin
        width: parent.width -2*x
        spacing: Theme.paddingLarge

        PageHeader {
            title: qsTr("App Settings")
        }

//        VerticalScrollDecorator {}

        Column {
            width: parent.width

            ComboBox {
                id: source
                width: parent.width
                label: qsTr("Source")+":"

                menu: ContextMenu {
                    MenuItem { text: "floatrates.com" }
                    MenuItem { text: "exchangerate-api.com" }
                }

                onCurrentIndexChanged: {
                    rateModel.source = currentIndex
                    Parser.setSetting('source', currentIndex)
                }
            }

            Text {
                width: parent.width - 2*x
                x: Theme.horizontalPageMargin
                wrapMode: Text.WordWrap
                color: Theme.highlightColor
                font.pixelSize: Theme.fontSizeMedium
                text: qsTr("Requires a rate update or selection of a new base rate to take affect.")
            }
        }

        TextSwitch {
            id: updateCTL
            text: qsTr("Rearrange 'Convert to' list")
            description: qsTr("Puts the selected currency on top of 'Convert to' list.")
            onCheckedChanged: {
                rateModel.updateConvertToList = checked
                Parser.setSetting('updateCTL', checked)
            }
        }

        Column {
            width: parent.width

            Button {
                id: resetButton
                anchors.horizontalCenter: parent.horizontalCenter
                text: qsTr("Reset Currency List")
                onClicked: Remorse.itemAction(resetButton, qsTr("Resetting List"), function(){res = Parser.resetCurrencies()})

                property int res: 0
            }

            Text {
                width: parent.width -2*x
                x: Theme.horizontalPageMargin
                wrapMode: Text.WordWrap
                color: Theme.highlightColor
                font.pixelSize: Theme.fontSizeMedium
                text: resetButton.res > 0 ? qsTr("List was successfully reset"):qsTr("This button resets the 'Convert to' list to an alphabetical order.")
            }
        }
    }
}
