import QtQuick 2.0
import Sailfish.Silica 1.0
import QtQuick.LocalStorage 2.0
import "../js/parser.js" as Parser

Page {
    id: root

    property string state: ""
    property bool modelDataError: false
    property string statusMessage: ""

    // The effective value will be restricted by ApplicationWindow.allowedOrientations
    allowedOrientations: Orientation.All

    // To enable PullDownMenu, place our content in a SilicaFlickable
    SilicaFlickable {
        anchors.fill: parent

        // PullDownMenu and PushUpMenu must be declared in SilicaFlickable, SilicaListView or SilicaGridView
        PullDownMenu {
            busy: rateModel.updating
            MenuItem {
                text: qsTr("About")
                onClicked: pageStack.push(Qt.resolvedUrl("AboutPage.qml"))
            }
            MenuItem {
                text: qsTr("Options")
                onClicked: pageStack.push(Qt.resolvedUrl("OptionPage.qml"))
            }
            MenuItem {
                text: qsTr("Select Base Currency")
                onClicked: pageStack.push(Qt.resolvedUrl("BasePage.qml"))
            }
            MenuItem {
                text: qsTr("Update Rates")
                onClicked: {
                    Parser.getBaseRates(rateModel.baseCurrency, true)
                }
                visible: rateModel.count > 1
            }
        }

        // Tell SilicaFlickable the height of its content.
        contentHeight: column.height
        VerticalScrollDecorator {}

        Rectangle {
            id: popUp
            anchors.fill: parent
            z: 500
            color: Qt.rgba(0, 0, 0, 0.6)
            visible: msg !== ""

            default property alias msg: msgBox.text

            Column {
                anchors.verticalCenter: parent.verticalCenter
                x: Theme.paddingLarge
                width: parent.width -2*x
                spacing: Theme.paddingLarge

                Text {
                    id: msgBox
                    anchors.horizontalCenter: parent.horizontalCenter
                    width: parent.width
                    wrapMode: Text.WordWrap
                    textFormat: Text.RichText
                    color: Theme.highlightColor
                    font.pixelSize: Theme.fontSizeMedium
                    text: rateModel.errorMsg
                }

                Button {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: qsTr("Okay")

                    onClicked: {
                        rateModel.errorMsg = ""
                    }
                }
            }
        }


        // Place our content in a Column.  The PageHeader is always placed at the top
        // of the page, followed by our content.
        Column {
            id: column
            width: parent.width
            spacing: Theme.paddingMedium

            PageHeader {
                id: pageHead
                title: qsTr("ExRates")
            }

            Column {
                id: content

                x: Theme.horizontalPageMargin
                width: root.width - 2*x
                spacing: Theme.paddingMedium
                visible: rateModel.count > 1 && searchField.text === ""

                Text {
                    text: qsTr("Base Currency: ")+ "<br>" + rateModel.baseName
                    color: Theme.highlightColor
                    font.pixelSize: Theme.fontSizeLarge
                    textFormat: Text.RichText
                }
                Label {
                    text: qsTr("Last update: ")+rateModel.rateDate
                    color: Theme.secondaryHighlightColor
                    font.pixelSize: Theme.fontSizeSmall 
                }

                TextField {
                    id: insert
                    width: parent.width
                    label: qsTr("Sum to convert")
                    placeholderText: qsTr("Enter sum")
                    inputMethodHints: Qt.ImhDigitsOnly
                    text: qsTr("%L1").arg(input)

                    property double input

                    EnterKey.onClicked:  {
                        result.output = Math.round(text.replace(',', '.') * rateModel.rate*100)/100
                        insert.focus = false
                    }
                }

                TextField {
                    id: result
                    width: parent.width
                    color: Theme.highlightColor
                    inputMethodHints: Qt.ImhDigitsOnly
                    text: qsTr("%L1").arg(output)

                    placeholderText: qsTr("Result")
                    label: qsTr("Sum in ") + rateModel.cFullName

                    property double output

                    EnterKey.onClicked: {
                        insert.input = Math.round(text.replace(',', '.')*1/rateModel.rate*100)/100
                        result.focus = false
                    }
                }

                Label {
                    id: listHeader
                    color: Theme.secondaryHighlightColor
                    font.pixelSize: Theme.fontSizeLarge
                    text: qsTr("Convert to: ") + rateModel.cFullName
                }
            }

            Text {
                id: intro
                visible: rateModel.count == 0
                width: content.width
                x: Theme.horizontalPageMargin
                wrapMode: Text.WordWrap
                color: Theme.secondaryHighlightColor
                font.pixelSize: Theme.fontSizeLarge
                text: qsTr("Select a base currency from the drop down menu. This requires a internet connection. New rates can be downloaded once per day.")
            }

            SearchField {
                id:searchField
                 width: parent.width
                 placeholderText: qsTr("Search")
                 visible: false
                 height: visible ? Theme.itemSizeSmall:0

                 onTextChanged: Parser.rateSearch(text)
             }

            SilicaListView {
                width: root.width
                height: root.height < 730 ? 600:root.height - content.height - pageHead.height - 2*column.spacing
                model: rateModel
                clip: true
                visible: rateModel.count > 0

                currentIndex: -1

                VerticalScrollDecorator {}

                BusyIndicator {
                    size: BusyIndicatorSize.Large
                    anchors.horizontalCenter: parent.horizontalCenter
                    running: rateModel.count === 0
                }

                header: searchField

                delegate: ListItem {
                    width: ListView.view.width
                    contentHeight: Theme.itemSizeSmall

                    Row {
                        id: line
                        x: Theme.horizontalPageMargin
                        spacing: Theme.paddingMedium
                        Image { source: "qrc:/icons/flags/"+ currency + ".png"}
                        Label { text: cName; width: line.contentWidth; clip: true }
                        Label { text: currency; width: Theme.fontSizeMedium*2 }
                        Label {
                            text: insert.text === "" || insert.text === "0" ? qsTr("%L1").arg(Math.round(rate*10000)/10000):qsTr("%L1").arg(Math.round(insert.text.replace(",",".") * rate*100)/100)
                            width: Theme.fontSizeMedium*3
                        }

                        property int contentWidth: root.width - 2*x - 3*spacing - 80 - Theme.fontSizeMedium*5
                    }
                    onClicked: {
                        rateModel.rate = rate
                        rateModel.cName = currency
                        if(rateModel.updateConvertToList){
                            Parser.rePosCurr(currency, 0)
                        }
                        searchField.text = ""
                        searchField.visible = false
                        Parser.loadRateModel()
                        result.text = Math.round(insert.text * rateModel.rate*100)/100
                    }

                    menu: Component {
                       id: contextMenu
                       ContextMenu {
                          MenuItem {
                              text: qsTr("Move up")
                              visible: index > 0
                              onClicked: {
                                  rateModel.move(index, index-1, 1)
                                  Parser.rePosCurr(currency, index-1)
                              }
                          }
                          MenuItem {
                              text: qsTr("Move down")
                              visible: index < rateModel.count -1
                              onClicked: {
                                  rateModel.move(index, index+1, 1)
                                  Parser.rePosCurr(currency, index+1)
                              }
                          }
                       }
                    }
                }
            }
        }

        PushUpMenu {
            MenuItem {
                text: searchField.visible ? qsTr("Hide search field"):qsTr("Show search field")
                onClicked: searchField.visible = !searchField.visible
            }
        }
    }
}
