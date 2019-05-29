import QtQuick 2.0
import Sailfish.Silica 1.0
import QtQuick.LocalStorage 2.0
import "../js/parser.js" as Parser

Page {
    id: page

    property bool inProgress: false

    // The effective value will be restricted by ApplicationWindow.allowedOrientations
    allowedOrientations: Orientation.All

    Component.onCompleted: {
        Parser.getBaseRates("EUR", false)
    }

    onInProgressChanged: {
        if(inProgress){
            content.visible = true
            pageStack.pop()
        }
    }

    SilicaFlickable {
        anchors.fill: parent

        PullDownMenu {
            MenuItem {
                text: cSearch.visible ? qsTr("Hide search field"):qsTr("Show search field")
                onClicked: {
                    cSearch.visible = !cSearch.visible
                }
            }
        }

        BusyIndicator {
            anchors.centerIn: parent
            running: (baseRateModel.count === 0 && !rateModel.hasError) || !content.visible
            size: BusyIndicatorSize.Large
        }

        Text {
            anchors.centerIn: parent
            x: Theme.paddingLarge
            width: parent.width -2*x
            visible: rateModel.hasError
            text: rateModel.errorMsg
        }

        Column {
            id:content
            anchors.fill: parent

            PageHeader {
                id: pHeader
                title: qsTr("Base Currency")
            }

            SearchField {
                id: cSearch
                width: parent.width
                visible: false
                placeholderText: qsTr("Search")

                onTextChanged: Parser.baseRateSearch(text)
            }

            SilicaListView {
                id: listView
                model: baseRateModel
                width: parent.width
                height: parent.height - pHeader.height - (cSearch.visible ? (cSearch.height+2*content.spacing):content.spacing)
                clip: true

                currentIndex: -1

                delegate: BackgroundItem {
                    id: delegate

                    Row {
                        spacing: Theme.paddingMedium
                        x: Theme.paddingLarge
                        width: parent.width - Theme.paddingLarge*2

                        Image {
                            source: "qrc:/icons/flags/"+ currency + ".png"
                            width: 80
                            anchors.verticalCenter: parent.verticalCenter
                        }

                        Label {
                            x: Theme.horizontalPageMargin
                            text: cName === "" ? currency:cName
                            anchors.verticalCenter: parent.verticalCenter
                            color: delegate.highlighted ? Theme.highlightColor : Theme.primaryColor
                        }
                    }

                    onClicked: {
                        content.visible = false
                        rateModel.baseName = cName
                        rateModel.baseCurrency = currency
                        Parser.setSetting("baseCurrency", currency)
                        Parser.setSetting("baseName", cName)
                        page.inProgress = Parser.getBaseRates(currency, true)
                    }
                }
                VerticalScrollDecorator {}
            }
        }
    }
}
