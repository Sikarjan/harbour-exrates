Qt.include("QtQuick.LocalStorage");
var response
var cNamesTxt = '{"AUD":"Australian Dollar", "BRL":"Brazilian Real", "CAD":"Canadian Dollar", "CHF":"Swiss Franc", "CNY":"Chinese Renminbi", "CZK":"Czech Koruna", "DKK":"Danish Krone", "EUR":"Euro", "GBP":"Pound Sterling", "HKD":"Hong Kong Dollar", "HUF":"Hungarian Forint", "IDR":"Indonesian Rupiah", "ILS":"Israeli Shekel", "INR":"Indian Rupee", "ISK":"Icelandic Krona", "JPY":"Japanese Yen", "KRW":"South Korean Won", "MXN":"Mexican Peso", "MYR":"Malaysian Ringgit", "NOK":"Norwegian Krone", "NZD":"New Zealand Dollar", "PEN":"Peruvian Nuevo Sol", "PHP":"Philippine Peso", "PLN":"Polish Zloty", "RON":"Romanian Leu", "RUB":"Russian Ruble", "SAR":"Saudi Riyal", "SEK":"Swedish Krona", "SGD":"Singapore Dollar", "THB":"Thai Baht", "TRY":"Turkish Lira", "TWD":"New Taiwan Dollar", "USD":"US Dollar", "ZAR":"South African Rand" }'
var cNames = JSON.parse(cNamesTxt)

function getBaseRates(currency){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.exchangerate-api.com/v4/latest/"+currency);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
            response = JSON.parse(xhr.responseText)
            if(typeof response.time_last_updated === 'undefined'){
                rateModel.hasError = true
                rateModel.errorMsg = qsTr("The api respnded with an error. Currently no exchange rates are available. Please try again later or file a bug report on GitHub, see about page for details.")
            }else{
                rateModel.hasError = false
                editResponse(response, currency);
            }
        }else{
            rateModel.hasError = true
            rateModel.errorMsg = qsTr("The api did not respond. Please try again laiter.")
            console.log(xhr.error)
        }
      }
    };

    xhr.send();
}

function editResponse(response, baseRate){
    rateModel.clear()
    baseRateModel.clear()
    clearTable()

    rateModel.rateDate = new Date(response.time_last_updated*1000);
    setSetting("lastUpdate", rateModel.rateDate)

    var i = 0
    for(var currency in response.rates){
        if(currency !== baseRate){
            setSetting(currency, response.rates[currency])
            rateModel.append({"currency": currency, "cName": cNames[currency], "rate": parseFloat(response.rates[currency])})
        }
        baseRateModel.append({"currency": currency, "cName": cNames[currency], "rate": parseFloat(response.rates[currency])})
    }
}

function getDatabase() {
    return LocalStorage.openDatabaseSync("Settings", "1.0", "StorageDatabase", 100000);
}

function initialize() {
    var db = getDatabase();

    db.transaction(
                function(tx) {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS'+
                                  ' settings(setting TEXT UNIQUE, value TEXT)');
                });
}

function clearTable(){
    var db = getDatabase();

    db.transaction(
                function(tx) {
                    tx.executeSql('DELETE FROM settings');
                });
}

function setSetting(setting, value) {
    var db = getDatabase();
    var res = "";
    db.transaction(function(tx) {
        var rs = tx.executeSql('INSERT OR REPLACE INTO settings'+
                               ' VALUES (?,?);', [setting,value]);
        res = rs.rowsAffected > 0 ? "OK":"NOK";
    });
    return res;
}

function getSetting(setting) {
    var db = getDatabase();
    var res="";
    db.transaction(function(tx) {
        var rs = tx.executeSql('SELECT value FROM settings WHERE'+
                               ' setting=?;', [setting]);
        res = rs.rows.length > 0 ? rs.rows.item(0).value:"";
    });
    return res;
}

function getSettings() {
    var db = getDatabase();
    var res="";
    db.transaction(function(tx) {
        var rs = tx.executeSql('SELECT * FROM settings ORDER BY setting');
        if(rs.rows.length > 0){
            for(var i=0;i<rs.rows.length;i++){
//                console.log(rs.rows.item(i).setting +": " +rs.rows.item(i).value)
                if(rs.rows.item(i).setting === "lastUpdate"){
                    rateModel.rateDate = rs.rows.item(i).value
                }else if(rs.rows.item(i).setting === "baseCurrency"){
                    rateModel.baseCurrency = rs.rows.item(i).value
                    rateModel.baseName = cNames[rs.rows.item(i).value]
                }else if(rs.rows.item(i).setting === "cName"){
                    rateModel.cName = rs.rows.item(i).value
                }else if(rs.rows.item(i).setting === "cRate"){
                    rateModel.rate = rs.rows.item(i).value
                }else{
                    rateModel.append({"currency": rs.rows.item(i).setting, "cName": cNames[rs.rows.item(i).setting], "rate": parseFloat(rs.rows.item(i).value)})
                }
            }
        }
    });
    console.log()
}
