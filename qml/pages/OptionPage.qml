import QtQuick 2.0
import Sailfish.Silica 1.0
import QtQuick.LocalStorage 2.0
import "../js/parser.js" as Parser

Dialog {
    id: page

    Component.onCompleted: {
        apiToken.text = Parser.getSetting('exchangeRateKey');
        source.currentIndex = rateModel.source
        updateCTL.checked = rateModel.updateConvertToList
    }

    onAccepted: {
        Parser.setSetting('source', source.currentIndex)
        Parser.setSetting('exchangeRateKey', apiToken.text)
        rateModel.apiKey = apiToken.text
    }

    allowedOrientations: Orientation.All

    SilicaFlickable {
        anchors.fill: parent

        DialogHeader {
            id: header
            title: qsTr("App Settings")
            acceptText: qsTr("Save")
            cancelText: qsTr("Cancel")
        }

        Column {
            anchors.top: header.bottom
 //           x: Theme.horizontalPageMargin
            width: parent.width //-2*x
            spacing: Theme.paddingLarge

            Column {
                width: parent.width

                ComboBox {
                    id: source
                    width: parent.width
                    label: qsTr("Source")+":"

                    menu: ContextMenu {
                        MenuItem { text: "floatrates.com" }
                        MenuItem { text: "exchangerate-api.com" }
                        MenuItem { text: "frankfurter.app" }
                    }

                    onCurrentIndexChanged: {
                        rateModel.source = currentIndex
                        baseRateModel.clear()
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

            Column {
                width: parent.width
                spacing: Theme.paddingMedium
                visible: source.currentIndex === 1

                Label {
                    width: parent.width -2*x
                    x: Theme.horizontalPageMargin
                    wrapMode: Text.WordWrap
                    color: Theme.highlightColor
                    font.pixelSize: Theme.fontSizeLarge
                    text: qsTr("Personal access tokens")
                }

                Text {
                    width: parent.width -2*x
                    x: Theme.horizontalPageMargin
                    wrapMode: Text.WordWrap
                    color: Theme.highlightColor
                    font.pixelSize: Theme.fontSizeMedium
                    text: qsTr("Here personal access tokens for comercial websites can be added. Most websites offer a free plan for personal use.")
                }

                TextField {
                    id: apiToken
                    width: parent.width
                    label: qsTr("API Token for personal access to ExchangeRate")
                    placeholderText: "ExchangeRate.com"
                    EnterKey.iconSource: "image://theme/icon-m-enter-accept"
                    EnterKey.onClicked: focus = false
                }
            }
        }
    }
}
