import QtQuick 2.0
import Sailfish.Silica 1.0

CoverBackground {
    Text {
        id: label
        anchors.top: parent.top
        anchors.topMargin: Theme.paddingLarge
        anchors.bottomMargin: Theme.paddingMedium
        width: parent.width - 2*Theme.paddingMedium
        text: qsTr("Currency Converter")
        wrapMode: Text.WordWrap
        horizontalAlignment: Text.AlignHCenter
        color: Theme.secondaryHighlightColor
        font.pixelSize: Theme.fontSizeMedium
    }

    Image {
        id: img
        anchors.top: label.bottom
        anchors.topMargin: Theme.paddingMedium
        fillMode: Image.PreserveAspectFit
        width: label.width
        source: "qrc:/icons/app/appIcon.png"
        opacity: rateModel.rate !== 1 ? 0.4:1
    }

    Column {
        anchors.bottom: parent.bottom
        x: Theme.paddingMedium
        width: label.width
        visible: rateModel.rate !== 1
        spacing: Theme.paddingMedium

        Text {
            text: "1 "+ rateModel.baseCurrency + " = " + Math.round(rateModel.get(0).rate*100)/100 + " " + rateModel.cName
            font.pixelSize: Theme.fontSizeSmall
            verticalAlignment: Text.AlignVCenter
            horizontalAlignment: Text.AlignHCenter
            color: Theme.primaryColor
        }
        Text {
            text: "1 "+ rateModel.baseCurrency + " = " + Math.round(rateModel.get(1).rate*100)/100 + " " + rateModel.get(1).currency
            font.pixelSize: Theme.fontSizeSmall
            verticalAlignment: Text.AlignVCenter
            horizontalAlignment: Text.AlignHCenter
            color: Theme.primaryColor
        }
        Text {
            text: "1 "+ rateModel.baseCurrency + " = " + Math.round(rateModel.get(3).rate*100)/100 + " " + rateModel.get(2).currency
            font.pixelSize: Theme.fontSizeSmall
            verticalAlignment: Text.AlignVCenter
            horizontalAlignment: Text.AlignHCenter
            color: Theme.primaryColor
        }
        Text {
            text: "1 "+ rateModel.baseCurrency + " = " + Math.round(rateModel.get(3).rate*100)/100 + " " + rateModel.get(3).currency
            font.pixelSize: Theme.fontSizeSmall
            verticalAlignment: Text.AlignVCenter
            horizontalAlignment: Text.AlignHCenter
            color: Theme.primaryColor
        }
    }
}
