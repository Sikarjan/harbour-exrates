import QtQuick 2.0
import Sailfish.Silica 1.0

CoverBackground {
    Text {
        id: label
        anchors.top: parent.top
        anchors.topMargin: Theme.paddingLarge
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
    }

    Text {
        anchors.top: img.bottom
        anchors.bottom: parent.bottom
        x: Theme.paddingMedium
        width: label.width
        visible: rateModel.rate !== 1
        text: "1 "+ rateModel.baseCurrency + " = " + Math.round(rateModel.rate*100)/100 + " " + rateModel.cName
        font.pixelSize: Theme.fontSizeSmall
        verticalAlignment: Text.AlignVCenter
        horizontalAlignment: Text.AlignHCenter
        color: Theme.primaryColor
    }
}
