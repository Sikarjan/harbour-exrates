Qt.include("QtQuick.LocalStorage");
var response
var cNamesTxt = '{"AUD":"Australian Dollar", "BGN":"Bulgarian Lev", "BRL":"Brazilian Real", "CAD":"Canadian Dollar", "CHF":"Swiss Franc", "CNY":"Chinese Renminbi", "CZK":"Czech Koruna", "DKK":"Danish Krone", "EUR":"Euro", "GBP":"Pound Sterling", "HKD":"Hong Kong Dollar", "HRK":"Croatian Kuna", "HUF":"Hungarian Forint", "IDR":"Indonesian Rupiah", "ILS":"Israeli Shekel", "INR":"Indian Rupee", "ISK":"Icelandic Krona", "JPY":"Japanese Yen", "KRW":"South Korean Won", "MXN":"Mexican Peso", "MYR":"Malaysian Ringgit", "NOK":"Norwegian Krone", "NZD":"New Zealand Dollar", "PEN":"Peruvian Nuevo Sol", "PHP":"Philippine Peso", "PLN":"Polish Zloty", "RON":"Romanian Leu", "RUB":"Russian Ruble", "SAR":"Saudi Riyal", "SEK":"Swedish Krona", "SGD":"Singapore Dollar", "THB":"Thai Baht", "TRY":"Turkish Lira", "TWD":"New Taiwan Dollar", "USD":"US Dollar", "ZAR":"South African Rand" }'
var cNames = JSON.parse(cNamesTxt)

function getBaseRates(currency, save){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.exchangerate-api.com/v4/latest/"+currency);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
            response = JSON.parse(xhr.responseText)
            if(typeof response.time_last_updated === 'undefined'){
                rateModel.hasError = true
                rateModel.errorMsg = qsTr("The api responded with an error. Currently no exchange rates are available. Please try again later or file a bug report on GitHub, see about page for details.")
            }else{
                rateModel.hasError = false
                if(save){
                    editResponse(response, currency);
                }else{
                    updateBaseRateModel(response);
                }
            }
        }else{
            rateModel.hasError = true
            rateModel.errorMsg = qsTr("The api did not respond. Please try again laiter.")
            console.log(xhr.statusText)
        }
      }
    };

    xhr.send();
}
function updateBaseRateModel(response){
    baseRateModel.clear()

    for(var currency in response.rates){
        baseRateModel.append({"currency": currency, "cName": cNames[currency], "rate": parseFloat(response.rates[currency])})
    }
}

function editResponse(response, baseRate){
    rateModel.clear()
    clearCurrencies()

    var time = new Date(response.time_last_updated*1000);
    var options = {
        year: "numeric", month: "2-digit",
        day: "2-digit", hour: "2-digit", minute: "2-digit"
    };
    rateModel.rateDate = time.toLocaleString(Qt.locale().name, options)

    setSetting("lastUpdate", rateModel.rateDate)

    for(var currency in response.rates){
        if(currency !== baseRate){
            setCurrValue(currency, response.rates[currency])
        }
    }

    loadRateModel()
}

function getDatabase() {
    return LocalStorage.openDatabaseSync("Settings", "1.0", "StorageDatabase", 100000);
}

function initSettings() {
    var db = getDatabase();

    db.transaction(
                function(tx) {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS'+
                                  ' settings(setting TEXT UNIQUE, value TEXT)');
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
                    console.log("Unknown Setting: "+rs.rows.item(i).setting)
                }
            }
        }
    });

    loadRateModel()
}

function loadRateModel() {
    var db = getDatabase();

    db.transaction(function(tx) {
        var rs = tx.executeSql('SELECT * FROM currencies WHERE rate <> 0 ORDER BY pos ASC');
        if(rs.rows.length > 0){
            for(var i=0;i<rs.rows.length;i++){
                rateModel.append({"currency": rs.rows.item(i).currency, "cName": cNames[rs.rows.item(i).currency], "rate": rs.rows.item(i).rate})
//console.log(rs.rows.item(i).pos + ": " +rs.rows.item(i).currency )
            }
        }
    });
}

function initCurrencies(){
    var db = getDatabase();

    db.transaction(
                function(tx) {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS'+
                                  ' currencies(currency TEXT UNIQUE, rate REAL, pos INTEGER)');
                   });
}

function setCurrValue(curr, value){
    var db = getDatabase()
    var res = ""
    db.transaction(function(tx) {
        var rs = tx.executeSql('INSERT OR REPLACE INTO currencies'+
                               ' (currency, rate, pos) VALUES (?,?, COALESCE((SELECT pos FROM currencies WHERE currency = ?), 1));', [curr,value,curr]);
        res = rs.rowsAffected > 0 ? "OK":"NOK";
    });
    return res;
}

function rePosCurr(curr, pos){
    var db = getDatabase()
    var res = ""

    db.transaction(function(tx) {
       tx.executeSql('UPDATE currencies SET pos = pos + 1 WHERE pos <150 AND pos >= ?', [pos])
    });

    db.transaction(function(tx) {
        var rs = tx.executeSql('UPDATE currencies'+
                               ' SET pos = ? WHERE currency = ?', [pos, curr]);
        res = rs.rowsAffected > 0 ? "OK":"NOK";
    });
    return res;
}

function clearCurrencies(){
    var db = getDatabase();

    db.transaction(
                function(tx) {
                    tx.executeSql('UPDATE currencies SET rate = 0');
                });
}
