import QtQuick 2.0
import Sailfish.Silica 1.0

Page {
    id: page

    // The effective value will be restricted by ApplicationWindow.allowedOrientations
    allowedOrientations: Orientation.All

    Column {
        anchors.top: parent.top
        anchors.bottom: parent.bottom
        x: Theme.horizontalPageMargin
        width: parent.width - 2*x
        spacing: Theme.paddingMedium

        VerticalScrollDecorator {}

        PageHeader {
            title: qsTr("About")
        }

        Label {
            width: parent.width
            color: Theme.highlightColor
            font.pixelSize: Theme.fontSizeMedium
            text: qsTr("Version:")+" 0.3"
        }

        Text {
            id: listView
            width: parent.width
            wrapMode: Text.WordWrap
            textFormat: Text.RichText
            color: Theme.highlightColor
            font.pixelSize: Theme.fontSizeMedium
            text: "<html><style>a {color:"+ Theme.primaryColor +";}</style>" +qsTr("<p>Currently this app only uses one open source api to get exchange rates. The used api is <a href=\"https://www.exchangerate-api.com/index.php\">ExchangeRate-API</a>. This api does not provide rates for all currencies therefore the currency your are looking for might miss. I will try to add other resources at a later stage. Also the rates are only updated once per day.</p>
<p>Please support me by sending bug reports via Github. You can find the project <a href=\"https://github.com/Sikarjan/harbour-exrates\">here</a>.</p>")+"</html>"
            onLinkActivated: Qt.openUrlExternally(link);
        }
    }
}
