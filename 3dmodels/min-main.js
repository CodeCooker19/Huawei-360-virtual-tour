var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
var selectedTheme = 'none';

function ShowListNames(){
    document.getElementById('mobile-min-text2').style.display = 'table-cell';

    if (selectedTheme == "5G") {
        document.getElementById('mobile-min-text2').style.display = 'none';
        $("#mobile-min-text1").text("Virtual Academy");
        $("#mobile-min-text2").text("Online Developer Zone");
        $("#mobile-min-text3").text("5G Knowledge");
        $("#mobile-min-text4").text("Education & Health");
        $("#mobile-min-text5").text("Industry 4.0");
        $("#mobile-min-text6").text("Media & Entertainment");
        $("#mobile-min-text7").text("Logistics & Transportation");
    } else if (selectedTheme == "AI") {
        $("#mobile-min-text1").text("Virtual Academy");
        $("#mobile-min-text2").text("Online Developer Zone");
        $("#mobile-min-text3").text("Institute of Higher Learning");
        $("#mobile-min-text4").text("Co-Partner Solutions");
        $("#mobile-min-text5").text("Economy Transformations");
        $("#mobile-min-text6").text("AI Introduction");
        $("#mobile-min-text7").text("Intelligent Metropolis");
    } else if (selectedTheme == "CLOUD") {
        $("#mobile-min-text1").text("Virtual Academy");
        $("#mobile-min-text2").text("Online Developer Zone");
        $("#mobile-min-text3").text("EI Healthcare + Education");
        $("#mobile-min-text4").text("Logistics + Retail");
        $("#mobile-min-text5").text("Environment Development");
        $("#mobile-min-text6").text("Grow With Intelligence");
        $("#mobile-min-text7").text("Smart City");
    }
}

function SelectTheme(theme) {
    selectedTheme = theme;

    if(isMobile){
        ShowListNames();
    }
}

$('#5g-button', window.document).on('click', function () {
    SelectTheme('5G');
});

$('#ai-button', window.document).on('click', function () {
    SelectTheme('AI');
});

$('#cloud-button', window.document).on('click', function () {
    SelectTheme('CLOUD');
});

function showSceneNum(SceneNum){
    var num = parseInt(SceneNum);
    parent.HideIFrameContainer();
    parent.DestroyInteractivesAfterTime();
    parent.LoadScene(parent.scenes[num]);
}
$('.minmap-row .cell').click(function(e){
    e.preventDefault();
    var num = $(this).attr("value");
    
    showSceneNum(num);
});

window.onclick = function(event) {
    var modal = document.getElementById("mobile-minmap-table-out");
    if (event.target == modal) {
        parent.HideIFrameContainer();
    }
}