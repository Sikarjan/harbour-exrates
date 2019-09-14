import QtQuick 2.0
import Sailfish.Silica 1.0
import QtQuick.LocalStorage 2.0
import "pages"
import "js/parser.js" as Parser

ApplicationWindow
{
    initialPage: Component { FirstPage { } }
    cover: Qt.resolvedUrl("cover/CoverPage.qml")
    allowedOrientations: defaultAllowedOrientations

    ListModel {
        id: rateModel

        property string baseCurrency: ""
        property string baseName: ""
        property string cName: ""
        property string cFullName: ""
        property real rate: 0
        property string rateDate: ""
        property bool hasError: false
        property string errorMsg: ""
        property int source: 0
        property bool updateConvertToList
        property bool updating: false

        onCNameChanged: {
            cFullName = Parser.cNames[cName]
            if(rateModel.rate > 0){
                Parser.setSetting("cName", rateModel.cName)
                Parser.setSetting("cRate", rateModel.rate)
            }
        }
    }
    ListModel {
        id: baseRateModel
    }
    ListModel {
        id:rateModelCopy
    }

    Component.onCompleted: {
        Parser.initSettings()
        Parser.initCurrencies()
        if(Parser.getSetting("lastUpdate") !== ""){
            Parser.getSettings()
        }
    }
}
