Qt.include("QtQuick.LocalStorage");
var response
var baseRateModelCopy

function getBaseRates(currency, save){
    var xhr = new XMLHttpRequest();
    var url

    if(rateModel.source === 0){
        url = "https://www.floatrates.com/daily/"+currency+".json"
    }else{
        url = "https://api.exchangerate-api.com/v4/latest/"+currency
    }
console.log(url)
    xhr.open("POST", url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
            response = JSON.parse(xhr.responseText)
            if(response.length < 15){
                rateModel.hasError = true
                rateModel.errorMsg = qsTr("The api responded with an error. Currently no exchange rates are available. Please try again later or file a bug report on GitHub, see about page for details.")
            }else{
                rateModel.hasError = false
                if(save){
                    editResponse(response, currency);
                }else{
                    updateBaseRateModel();
                }
                return true
            }
        }else{
            rateModel.hasError = true
            rateModel.errorMsg = xhr.status === 404 ? qsTr("The server was not able to load rates for this currency. Please select a different base currency."):qsTr("The api did not respond. Please try again later.")
            console.log(xhr.statusText)
        }
      }
    };

    xhr.send();
}
function updateBaseRateModel(){
    baseRateModel.clear()
    var currency

    if(rateModel.source === 0){
        baseRateModel.append({"currency": "EUR", "cName": "Euro"})
        response = sortByProperty(response, "name")
        baseRateModelCopy = response
        for(var i in response){
            baseRateModel.append({"currency": response[i].code, "cName": cNames[response[i].code]})
        }
    }else{
        baseRateModelCopy.clear()
        for(currency in response.rates){
            baseRateModel.append({"currency": currency, "cName": cNames[currency]})
            baseRateModelCopy.push({"currency": currency, "cName": cNames[currency]})
        }
    }
}

function baseRateSearch(querry){
    baseRateModel.clear();

    for (var i=0; i<baseRateModelCopy.length; i++) {
        if (querry === "" || baseRateModelCopy[i].name.indexOf(querry) >= 0) {
            baseRateModel.append({"currency": baseRateModelCopy[i].code, "cName": baseRateModelCopy[i].name})
        }
    }
    if(baseRateModel.count === 0){
        baseRateModel.append({"currency": "ERR", "cName": qsTr("No match") })
    }
}

function rateSearch(querry){
    rateModel.clear()

    for (var i=0; i<rateModelCopy.count; i++) {
        if (querry === "" || rateModelCopy.get(i).cName.indexOf(querry) >= 0) {
            rateModel.append(rateModelCopy.get(i))
        }
    }
    if(rateModel.count === 0){
        rateModel.append({"cName": qsTr("No match"), "currency": "ERR", "rate": 0 })
    }
}

function editResponse(response, baseRate){
    var time
    var currency

    clearCurrencies()

    if(rateModel.source === 0){
        time = new Date(response[baseRate === "EUR" ? "usd":"eur"].date)
        response = sortByProperty(response, "name")
        for(var i in response){
            setCurrValue(response[i].code, response[i].rate)
        }
    }else{
        time = new Date(response.time_last_updated*1000);
        for(currency in response.rates){
            if(currency !== baseRate){
                setCurrValue(currency, response.rates[currency])
            }
        }
    }


    var options = {
        year: "numeric", month: "2-digit",
        day: "2-digit", hour: "2-digit", minute: "2-digit"
    };
    rateModel.rateDate = time.toLocaleString(Qt.locale().name, options)

    setSetting("lastUpdate", rateModel.rateDate)

    loadRateModel()

    if(pageStack.currentPage){
        pageStack.pop()
    }
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
                }else if(rs.rows.item(i).setting === "baseName"){
                    rateModel.baseName = rs.rows.item(i).value
                }else if(rs.rows.item(i).setting === "cName"){
                    rateModel.cName = rs.rows.item(i).value
                }else if(rs.rows.item(i).setting === "cRate"){
                    rateModel.rate = rs.rows.item(i).value
                }else if(rs.rows.item(i).setting === "source"){
                    rateModel.source = rs.rows.item(i).value
                }else if(rs.rows.item(i).setting === "updateCTL"){
                    rateModel.updateConvertToList = rs.rows.item(i).value === "0" ? false:true
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

    rateModel.clear()
    rateModelCopy.clear()

    db.transaction(function(tx) {
        var rs = tx.executeSql('SELECT * FROM currencies WHERE rate <> 0 ORDER BY pos ASC');
        if(rs.rows.length > 0){
            for(var i=0;i<rs.rows.length;i++){
                rateModel.append({"currency": rs.rows.item(i).currency, "cName": cNames[rs.rows.item(i).currency], "rate": rs.rows.item(i).rate})
                rateModelCopy.append({"currency": rs.rows.item(i).currency, "cName": cNames[rs.rows.item(i).currency], "rate": rs.rows.item(i).rate})
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
       tx.executeSql('UPDATE currencies SET pos = pos + 1 WHERE pos < 200 AND pos >= ?', [pos])
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

function resetCurrencies(){
    var db = getDatabase();
    var res

    db.transaction(
        function(tx){
           var rs = tx.executeSql('UPDATE currencies SET pos = 1');
           res = rs.rowsAffected;
        });

    if(res > 0){
        loadRateModel();
    }

    return res
}

function sortByProperty(a, prop){
    var clone = [];

    for(var i in a){
        var insert = {"name": a[i].name, "rate": a[i].rate, "code": a[i].code}
        clone.push(insert);
    }

    clone.sort(function(a, b) {
        if (a[prop] === b[prop]) {
            return 0;
        }
        else {
            return (a[prop] < b[prop]) ? -1 : 1;
        }
    } );

    return clone;
}

var cNames = {
    "AED": qsTr("U.A.E Dirham"),
    "AFN": qsTr("Afghan Afghani"),
    "ALL": qsTr("Albanian Lek"),
    "AMD": qsTr("Armenia Dram"),
    "ANG": qsTr("Neth. Antillean Guilder"),
    "AOA": qsTr("Angolan Kwanza"),
    "ARS": qsTr("Argentine Peso"),
    "AUD": qsTr("Australian Dollar"),
    "AWG": qsTr("Aruban Florin"),
    "AZN": qsTr("Azerbaijan Manat"),
    "BAM": qsTr("Bosnia and Herzegovina convertible Mark"),
    "BBD": qsTr("Barbadian Dollar"),
    "BDT": qsTr("Bangladeshi Taka"),
    "BGN": qsTr("Bulgarian Lev"),
    "BHD": qsTr("Bahrain Dinar"),
    "BIF": qsTr("Burundian Franc"),
    "BND": qsTr("Brunei Dollar"),
    "BOB": qsTr("Bolivian Boliviano"),
    "BRL": qsTr("Brazilian Real"),
    "BSD": qsTr("Bahamian Dollar"),
    "BWP": qsTr("Botswana Pula"),
    "BYN": qsTr("Belarussian Ruble"),
    "BZD": qsTr("Belize Dollar"),
    "CAD": qsTr("Canadian Dollar"),
    "CDF": qsTr("Congolese Franc"),
    "CHF": qsTr("Swiss Franc"),
    "CLP": qsTr("Chilean Peso"),
    "CNY": qsTr("Chinese Yuan"),
    "COP": qsTr("Colombian Peso"),
    "CRC": qsTr("Costa Rican Col\u00f3n"),
    "CUP": qsTr("Cuban Peso"),
    "CVE": qsTr("Cape Verde Escudo"),
    "CZK": qsTr("Czech Koruna"),
    "DJF": qsTr("Djiboutian Franc"),
    "DKK": qsTr("Danish Krone"),
    "DOP": qsTr("Dominican Peso"),
    "DZD": qsTr("Algerian Dinar"),
    "EGP": qsTr("Egyptian Pound"),
    "ERN": qsTr("Eritrean Nakfa"),
    "ETB": qsTr("Ethiopian Birr"),
    "EUR": qsTr("Euro"),
    "FJD": qsTr("Fiji Dollar"),
    "GBP": qsTr("U.K. Pound Sterling"),
    "GEL": qsTr("Georgian Lari"),
    "GHS": qsTr("Ghanaian Cedi"),
    "GIP": qsTr("Gibraltar Pound"),
    "GMD": qsTr("Gambian Dalasi"),
    "GNF": qsTr("Guinean Franc"),
    "GTQ": qsTr("Guatemalan Quetzal"),
    "GYD": qsTr("Guyanese Dollar"),
    "HKD": qsTr("Hong Kong Dollar"),
    "HNL": qsTr("Honduran Lempira"),
    "HRK": qsTr("Croatian Kuna"),
    "HTG": qsTr("Haitian Gourde"),
    "HUF": qsTr("Hungarian Forint"),
    "IDR": qsTr("Indonesian Rupiah"),
    "ILS": qsTr("Israeli New Sheqel"),
    "INR": qsTr("Indian Rupee"),
    "IQD": qsTr("Iraqi Dinar"),
    "IRR": qsTr("Iranian Rial"),
    "ISK": qsTr("Icelandic Krona"),
    "JMD": qsTr("Jamaican Dollar"),
    "JOD": qsTr("Jordanian Dinar"),
    "JPY": qsTr("Japanese Yen"),
    "KES": qsTr("Kenyan Shilling"),
    "KGS": qsTr("Kyrgyzstan Som"),
    "KHR": qsTr("Cambodian Riel"),
    "KMF": qsTr("Comoro Franc"),
    "KRW": qsTr("South Korean Won"),
    "KWD": qsTr("Kuwaiti Dinar"),
    "KZT": qsTr("Kazakhstani Tenge"),
    "LAK": qsTr("Lao Kip"),
    "LBP": qsTr("Lebanese Pound"),
    "LKR": qsTr("Sri Lanka Rupee"),
    "LRD": qsTr("Liberian Dollar"),
    "LSL": qsTr("Lesotho Loti"),
    "LYD": qsTr("Libyan Dinar"),
    "MAD": qsTr("Moroccan Dirham"),
    "MDL": qsTr("Moldova Lei"),
    "MGA": qsTr("Malagasy Ariary"),
    "MKD": qsTr("Macedonian Denar"),
    "MMK": qsTr("Myanma Kyat"),
    "MNT": qsTr("Mongolian Togrog"),
    "MOP": qsTr("Macanese Pataca"),
    "MRO": qsTr("Mauritanian Ouguiya"),
    "MRU": qsTr("Mauritanian Ouguiya"),
    "MUR": qsTr("Mauritian Rupee"),
    "MVR": qsTr("Maldivian Rufiyaa"),
    "MWK": qsTr("Malawian Kwacha"),
    "MXN": qsTr("Mexican Peso"),
    "MYR": qsTr("Malaysian Ringgit"),
    "MZN": qsTr("Mozambican Metical"),
    "NAD": qsTr("Namibian Dollar"),
    "NGN": qsTr("Nigerian Naira"),
    "NIO": qsTr("Nicaraguan C\u00f3rdoba"),
    "NOK": qsTr("Norwegian Krone"),
    "NPR": qsTr("Nepalese Rupee"),
    "NZD": qsTr("New Zealand Dollar"),
    "OMR": qsTr("Omani Rial"),
    "PAB": qsTr("Panamanian Balboa"),
    "PEN": qsTr("Peruvian Nuevo Sol"),
    "PGK": qsTr("Papua New Guinean Kina"),
    "PHP": qsTr("Philippine Peso"),
    "PKR": qsTr("Pakistani Rupee"),
    "PLN": qsTr("Polish Zloty"),
    "PYG": qsTr("Paraguayan Guaran\u00ed"),
    "QAR": qsTr("Qatari Rial"),
    "RON": qsTr("Romanian New Leu"),
    "RSD": qsTr("Serbian Dinar"),
    "RUB": qsTr("Russian Rouble"),
    "RWF": qsTr("Rwandan Franc"),
    "SAR": qsTr("Saudi Riyal"),
    "SBD": qsTr("Solomon Islands Dollar"),
    "SCR": qsTr("Seychelles Rupee"),
    "SDG": qsTr("Sudanese Pound"),
    "SEK": qsTr("Swedish Krona"),
    "SGD": qsTr("Singapore Dollar"),
    "SLL": qsTr("Sierra Leonean Leone"),
    "SOS": qsTr("Somali Shilling"),
    "SRD": qsTr("Surinamese Dollar"),
    "SSP": qsTr("South Sudanese Pound"),
    "STN": qsTr("S\u00e3o Tom\u00e9 and Pr\u00edncipe Dobra"),
    "SVC": qsTr("Salvadoran Colon"),
    "SYP": qsTr("Syrian pound"),
    "SZL": qsTr("Swazi Lilangeni"),
    "THB": qsTr("Thai Baht"),
    "TJS": qsTr("Tajikistan Ruble"),
    "TMT": qsTr("New Turkmenistan Manat"),
    "TND": qsTr("Tunisian Dinar"),
    "TOP": qsTr("Tongan Pa\u02bbanga"),
    "TRY": qsTr("Turkish Lira"),
    "TTD": qsTr("Trinidad Tobago Dollar"),
    "TWD": qsTr("New Taiwan Dollar "),
    "TZS": qsTr("Tanzanian Shilling"),
    "UAH": qsTr("Ukrainian Hryvnia"),
    "UGX": qsTr("Ugandan Shilling"),
    "USD": qsTr("U.S. Dollar"),
    "UYU": qsTr("Uruguayan Peso"),
    "UZS": qsTr("Uzbekistan Sum"),
    "VES": qsTr("Venezuelan Bolivar"),
    "VND": qsTr("Vietnamese Dong"),
    "VUV": qsTr("Vanuatu Vatu"),
    "WST": qsTr("Samoan Tala"),
    "XAF": qsTr("Central African CFA Franc"),
    "XCD": qsTr("East Caribbean Dollar"),
    "XOF": qsTr("West African CFA Franc"),
    "XPF": qsTr("CFP Franc"),
    "YER": qsTr("Yemeni Rial"),
    "ZAR": qsTr("South African Rand"),
    "ZMW": qsTr("Zambian Kwacha")
}
