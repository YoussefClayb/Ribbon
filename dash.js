//if ($.cookie("user") == undefined) {
//    window.location.href = "/index.html";
//}

var queue = [[],[],[],[]];
var currentID = -1;
var currentObj = null;

var start = "https://d45670bd.ngrok.io";

var wavesurfer;

var loadIntoSidebar = function(data) {
    queue = [[],[],[],[]];
    console.log(data);
    for (var i = 0; i < data.length; i++) {
        if (data[i]["Additional_Information"] != null) {
            if (data[i]["Additional_Information"].indexOf("heart") !== -1 || data[i]["Additional_Information"].indexOf("Heart") !== -1) {
                queue[1].push(data[i]);
            } else if (data[i]["Additional_Information"].indexOf("allergy") !== -1 || data[i]["Additional_Information"].indexOf("Allergy") !== -1) {
                queue[2].push(data[i]);
            } else {
                queue[3].push(data[i]);
            }
        } else {
            queue[3].push(data[i]);
        }
    }
    
    $("#calls_in_queue").html("Calls in Queue : " + data.length);
    
    for (var j = 0; j < 4; j++) {
        $("#num_" + j).html(queue[j].length);
        $("#but_" + j).click(function(event) {
            var id = event.target.id;
            var numID = parseInt(id.substr(id.length - 1));
            currentObj = queue[numID][0];
            currentID = currentObj["id"];
            loadCase(currentObj);
        });
    }
}

var loadCase = function(data) {
    $("#invis").removeClass("invisible");
    
    loadInfo(data);
    
    loadMapInfo(data);
    
    loadAudio(data);
}

var deleteCase = function() {
    $("#invis").addClass("invisible");
    
    $.getJSON(start + '/api/delete/' + currentID, function(event){});
    
    location.reload();
}

var refresh = function() {
    $.getJSON(start + '/api/get/' + $.cookie("location"), function(data) {
        loadIntoSidebar(data);
    });
}

var loadInfo = function(data) {
    $("#phone_number").html(data["Phone_Number"]);
    $("#reason").html(data["Keywords"]);
    $("#firstName").html(data["First_Name"]);
    $("#lastName").html(data["Last_Name"]);
    $("#birthday").html(data["DOB"]);
    $("#address").html(data["Home_Address"]); 
    $("#additionalInfo").html(data["Additional_Information"]);
}

var loadMapInfo = function(data) {
    var gps = data["GPS"].split(",");
    var latLong = {lat: parseFloat(gps[0]), lng: parseFloat(gps[1])};
    
    // MAP SHIT
    map = new google.maps.Map(document.getElementById('map'), {
        center: latLong,
        zoom: 15
    });
    
    var marker = new google.maps.Marker({
          position: latLong,
          map: map,
          title: data["Home_Address"]
        });
}

var loadAudio = function(data) {
    var path = data["AudioUrl"];
    
    $("#waveform").empty();
    
    // =========== Load Wavesurfer ===========
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#4A90E2',
        progressColor: '#2D3E4F'
    });
    wavesurfer.on('ready', function () {
        wavesurfer.play();
    });

    // Load wav file here
    wavesurfer.load(path);

    // Add buttons for play, pause and stop
    document.getElementById("play").addEventListener("click", function() {
        wavesurfer.play();
    });
    document.getElementById("pause").addEventListener("click", function() {
        wavesurfer.pause();
    });
    document.getElementById("stop").addEventListener("click", function() {
        wavesurfer.stop();
    });
}

// =========== Buttons ===========

var CASE_OPEN = 0;
var CASE_SEND = 1;

var state = CASE_OPEN;

document.getElementById("redButton").addEventListener("click", function() {
    if (state == CASE_OPEN) {
        // Delete case and clear info
        deleteCase();
    } else if (state == CASE_SEND) {
        // Move back to case open
        document.getElementById("redButton").value = "IGNORE";
        document.getElementById("blueButton").value = "CONTINUE";
        state = CASE_OPEN; document.getElementById("info_holder").classList.remove("invisible"); document.getElementById("send_info").classList.add("invisible");
    }
});

document.getElementById("blueButton").addEventListener("click", function() {
    if (state == CASE_OPEN) {
        // Proceed to open case
        document.getElementById("redButton").value = "BACK";
        document.getElementById("blueButton").value = "SEND";
        state = CASE_SEND; document.getElementById("info_holder").classList.add("invisible"); document.getElementById("send_info").classList.remove("invisible");
        if (wavesurfer.isPlaying()){
            wavesurfer.stop()
        }
    } else if (state == CASE_SEND) {
        // Send service and clear case
        deleteCase();
        
        document.getElementById("redButton").value = "IGNORE";
        document.getElementById("blueButton").value = "CONTINUE";
        state = CASE_OPEN; document.getElementById("info_holder").classList.remove("invisible"); document.getElementById("send_info").classList.add("invisible");
    }
});

$("#signout").click(function() {
    $.removeCookie("user");
    $.removeCookie("location");
    location.reload();
});

// Google Maps
var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 0},
        zoom: 8
    });
}

refresh();
