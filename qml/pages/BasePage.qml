import QtQuick 2.0
import Sailfish.Silica 1.0
import QtQuick.LocalStorage 2.0
import "../js/parser.js" as Parser

Page {
    id: page

    // The effective value will be restricted by ApplicationWindow.allowedOrientations
    allowedOrientations: Orientation.All

    Component.onCompleted: {
        Parser.getBaseRates("EUR", false)
    }

    BusyIndicator {
        anchors.centerIn: parent
        running: baseRateModel.count === 0
        size: BusyIndicatorSize.Large
    }

    SilicaListView {
        id: listView
        model: baseRateModel
        anchors.fill: parent
        header: PageHeader {
            title: qsTr("Base Currency")
        }
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
                Parser.getBaseRates(currency, true)
                rateModel.baseName = cName
                rateModel.baseCurrency = currency
                Parser.setSetting("baseCurrency", currency)
                pageStack.pop()
            }
        }
        VerticalScrollDecorator {}
    }
}
