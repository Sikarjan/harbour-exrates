function post(query) {
//    console.log(query)
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://brk-aubing.de/xml/api.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(query);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
//            console.log("Got Headers:")
//            console.log(xhr.getAllResponseHeaders())
//            console.log("------------");
        }else if ( xhr.readyState == xhr.DONE && xhr.status == 200){
//            console.log(xhr.responseText);
            response = xhr.responseText;
        }
    }
}

function readPersList(rows){
    persList.clear()

    for(var i = 0;i<rows.length;i++){
        persList.append({"type": rows[i].type, "date": rows[i].date, "desc": rows[i].desc, "refId": parseInt(rows[i].refId), "sort": rows[i].sort, "typeId": parseInt(rows[i].typeId)})
    }
}

function readHidList(row){
    hidList.clear()

    for(var key in row){
        var value = row[key];
        hidList.append({"key": key, "value": value})
    }
}

function readHelferList(rows){
    helferList.clear()

    var pos = new Array(rows[0].hAnzahl+1)
    var j = 1

    if(rows[0].fuehrer === "1"){
        pos[1] = "Führer"
        j++
    }
    for(var k=0; k<rows[0].rs; k++){
        pos[j] = "RS"
        j++
    }
    for(k=0; k<rows[0].rs; k++){
        pos[j] = "Fahrer"
        j++
    }
    for(k = 0; k<=rows[0].helfer; k++){
        pos[j] = "Helfer"
        j++;
    }
    for(k=j; k<=rows[0].hAnzahl; k++){
        pos[j] = "Sanitäter"
        j++;
    }

    var offset = 0;
    var i = 1
    var l = 1;

    if(typeof rows[0].helfer !== 'undefined'){
        offset = parseInt(rows[0].helfer)+1
    }

    for(i = 1; i<j; i++){
        if(rows.length > l && parseInt(rows[l].pos)+offset === i){
            helferList.append({
                                  "helfer": parseInt(rows[l].helfer),
                                  "name": rows[l].name,
                                  "pos": pos[i],
                                  "start": rows[l].start,
                                  "ende": rows[l].ende,
                                  "anmerkung": rows[l].anmerkung
                              })
            l++;
        }else{
            helferList.append({
                                  "helfer": -1,
                                  "name": "offen",
                                  "pos": pos[i],
                                  "start": Qt.formatDateTime(new Date(rows[0].datum*1000),"hh:mm" ),
                                  "ende": Qt.formatDateTime(new Date(rows[0].ende*1000),"hh:mm" ),
                                  "anmerkung": ""
                              })
        }
    }
}

function readContactsList(rows){
    contactsList.clear()

    for(var i = 0;i<rows.length;i++){
        contactsList.append({"name": rows[i].name, "rank": rows[i].rank, "helfer": rows[i].hid, "edu": rows[i].edu})
    }
}
