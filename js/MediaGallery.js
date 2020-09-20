/*
const Item = ({
    type,
    title,
    url
}) => `
    <li class="sidebar-item">
        <button type="button" class="btn btn-link h-100 w-100 text-left p-3 sidebar-button"
                id='${title.replace(/\s+/g, '-')}' onclick="LoadMedia(event, '${type}','${title}','${url}')">
            <div class="item-title">${type}</div>
            <div class="item-description">${title}</div>
        </button>
    </li>
`;


$('.nav-sidebar').html([
    {
        type: 'IMAGE',
        title: 'Berlin 1',
        url: 'media/gallery/images/berlin1.jpg'
    },
    {
        type: 'IMAGE',
        title: 'Berlin 3',
        url: 'media/gallery/images/berlin3.jpg'
    },
    {
        type: 'VIDEO',
        title: 'Video',
        url: 'media/gallery/videos/small.mp4'
    },
    {
        type: 'IFRAME',
        title: '1280 Balanced Model',
        url: 'huawei/taishan1280/index.html?lang=en'
    },
    {
        type: 'IFRAME',
        title: '2180 Balanced Model',
        url: 'huawei/taishan2180/index.html?lang=en'
    },
    {
        type: 'IMAGE',
        title: 'Berlin 1',
        url: 'media/gallery/images/berlin1.jpg'
    },
    {
        type: 'IMAGE',
        title: 'Berlin 3',
        url: 'media/gallery/images/berlin3.jpg'
    },
    {
        type: 'VIDEO',
        title: 'Huawei-powered Qingdao Smart Grid',
        url: 'media/gallery/videos/small.mp4'
    },
    {
        type: 'IFRAME',
        title: '1280 Balanced Model',
        url: 'huawei/taishan1280/index.html?lang=en'
    },
    {
        type: 'IFRAME',
        title: '2180 Balanced Model',
        url: 'huawei/taishan2180/index.html?lang=en'
    }
].map(Item).join(''));
*/


// Video player
var videoPlayer = videojs('target-video', {
    controlBar: {
        pictureInPictureToggle: false
    }
});

console.log('video player: ' + videoPlayer);

// Hide target video here 
$("#target-video").css("display", "none");

// Hide media gallery
$(".media-overlay").addClass("hidden");

var lastTarget = null;

var activeBar = document.createElement('div');
activeBar.setAttribute('class', 'active-button');


function LoadMedia(event, type, title, url, thumbnailUrl) {
    console.log('event: ' + event.target);

    if (lastTarget !== null) {
        console.log('last target: ' + lastTarget);

        lastTarget.classList.remove("active");

        $("#" + lastTarget.id).children(".select-option").children(".check").css("border-color", "#AAAAAA");
        $("#" + lastTarget.id).children(".select-option").children(".check").children(".inside").css("background-color", "rgba(0, 0, 0, 0)");
    }

    lastTarget = event.target;
    event.target.classList.add("active");

    console.log(event.target.id);

    $("#" + event.target.id).children(".select-option").children(".check").css("border-color", "#F50000");
    $("#" + event.target.id).children(".select-option").children(".check").children(".inside").css("background-color", "#F50000");

    event.target.parentElement.insertAdjacentElement('beforeEnd', activeBar);

    console.log("Loading " + type + " media from: " + url);

    videoPlayer.pause();
        
    if (title == "Partner DIGI: AI Scale Device") {
        $('#main-content').css('background-image', "url('https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/scanning_machine_bg.jpg')");
    } else {
        $('#main-content').css('background-image', "url('https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/contentbg.png')");            
    }
    
    $("#main-content").removeClass('pr-3');
    $("#embedded-iframe").css('height', '');

    if (type == 'IMAGE') {
        LoadImage(url);
    } else if (type == 'VIDEO') {
        LoadVideo(url);
    } else if (type == 'PDF') {
        LoadPdf(url);
    } else if (type == 'INTERACTIVE') {
        
        console.log("Thumbnail: " + thumbnailUrl);
        if (thumbnailUrl != 'undefined') {
            console.log("loading image");
            LoadImage(thumbnailUrl, url);
        } else {
            console.log("loading iframe");         
            LoadIFrame(url);   
        }
    }

    $("#media-type").text(type + "\xa0");
    $("#media-title").text(title);
}

function LoadImage(url) {
    console.log('loading image');
    
    $("#media-image").unbind('click');
    
    // Container visibility
    $("#image-container").css("display", "block");
    $("#target-video").css("display", "none");
    $("#iframe-container").css("display", "none");
    $("#pdf-container").css("display", "none");

    /*
    $("#image-container").addClass("visible");
    $("#target-video").removeClass("visible");
    $("#iframe-container").removeClass("visible");
    
    $("#image-container").removeClass("hidden");
    $("#target-video").addClass("hidden");
    $("#iframe-container").addClass("visible");
    */

    $("#media-image").attr("src", url);
}

function LoadImage(url, outgoingLink) {
    console.log('loading image');

    // Container visibility
    $("#image-container").css("display", "block");
    $("#target-video").css("display", "none");
    $("#iframe-container").css("display", "none");
    $("#pdf-container").css("display", "none");

    /*
    $("#image-container").addClass("visible");
    $("#target-video").removeClass("visible");
    $("#iframe-container").removeClass("visible");
    
    $("#image-container").removeClass("hidden");
    $("#target-video").addClass("hidden");
    $("#iframe-container").addClass("visible");
    */

    console.log("link: " + outgoingLink);
    console.log("Null check: " + (outgoingLink == undefined));
    
    $("#media-image").attr("src", url);
    
    // Normal image
    if (outgoingLink == undefined) {
        $("#media-image").unbind('click');
        $("#media-image").mouseover(function(){
            $(this).css('cursor', 'auto');
        });
    } else {        
        $("#media-image").unbind('click').click(function(){
            var win = window.open(outgoingLink, '_blank');
        });

        $("#media-image").mouseover(function(){
            $(this).css('cursor', 'pointer');
        });

        $("#media-image").mouseleave(function(){
            $(this).css('cursor', 'auto');
        });
    }          
}

function LoadVideo(url) {

    // Container visibility
    $("#image-container").css("display", "none");
    $("#target-video").css("display", "block");
    $("#iframe-container").css("display", "none");
    $("#pdf-container").css("display", "none");

    /*
    $("#image-container").removeClass("visible");
    $("#target-video").addClass("visible");
    $("#iframe-container").removeClass("visible");
    
    $("#image-container").addClass("hidden");
    $("#target-video").removeClass("hidden");
    $("#iframe-container").addClass("hidden");
    */

    // Update player url
    videoPlayer.src({
        type: 'video/mp4',
        src: url,
        autoplay: true,
        controlBar: {
            pictureInPictureToggle: false
        }
    });

    videoPlayer.play();
}

function LoadIFrame(url) {
    // Container visibility
    $("#image-container").css("display", "none");
    $("#target-video").css("display", "none");
    $("#iframe-container").css("display", "block");
    $("#pdf-container").css("display", "none");

    /*
    $("#image-container").removeClass("visible");
    $("#target-video").removeClass("visible");
    $("#iframe-container").addClass("visible");
    
    $("#image-container").addClass("hidden");
    $("#target-video").addClass("hidden");
    $("#iframe-container").removeClass("hidden");
    */

    $("#embedded-iframe").attr("src", url);

    var myIframe = document.getElementById('embedded-iframe');

    myIframe.addEventListener("load", function () {

        console.log("iframe loaded");

        if (url.includes("huawei-models")) {
            var test = $("#embedded-iframe").contents().find("#bottom_icon")
            console.log("test: " + test.attr('id'));
            
            console.log('node: ' + $("#embedded-iframe").contents().find("#menu-node2").attr('id'));
            $("#embedded-iframe").contents().find("#menu-node2").hide();
            $("#embedded-iframe").contents().find("#menu-item-box2").hide();
            
            if (!$("#embedded-iframe").contents().find("#boomlicon7").length) {
                console.log("Adding boom");
                
                $("#embedded-iframe").contents().find("#bottom_icon").prepend('<span id="boomlicon7" onclick="boomView();" data-toggle="tooltip" data-placement="top" class="i18n" i18nkey="header.nav2" title="爆炸视图"></span>');
                $("#embedded-iframe").contents().find("#bottom_icon").prepend('<span id="boomlicon6" onclick="originView();" data-toggle="tooltip" data-placement="top" class="i18n" i18nkey="header.nav1" title="爆炸视图"></span>');
            }
            
            $("#embedded-iframe").contents().find("#closeMenu").click();
            
            $("#main-content").addClass('pr-3');
            $("#embedded-iframe").css('height', '');
        } else if (url.includes("weighing%20Machine.html")) {
            $("#main-content").addClass('pr-3');
            $("#embedded-iframe").css('height', '85%');
                   
       } else {
            $("#main-content").removeClass('pr-3');
            $("#embedded-iframe").css('height', '');
        }
    });
}

function ShowMediaGallery(contentId, category) {
    contentId = contentId.replace(/\s+/g, '-').replace(/\+/g, "_").replace(/:\s*/g, "_").replace(/,/g, '-');


    console.log("Showing media gallery for: " + contentId + " category: " + category);
    
    if (category != null) {
     
        $("#area-name").html(category);   
    }

    var id = '#' + contentId;

    console.log('selecting: ' + id);
    
    console.log('test: ' + $(id).attr('id'));

    // Invoke a click for that button
    $(id).click();
    
    
    if (category != null) {
        $('.sidebar-item').each(function(){
            if($(this).attr('category') != category){
                $(this).hide();
            } else {
                $(this).show();
            }
        });

        $('.sidebar-folder').each(function(){
            console.log('folder category: ' + $(this).attr('category'));

            if($(this).attr('category') != category){
                $(this).hide();
            } else {
                $(this).show();
            }
        });
        }

    $(".media-overlay").removeClass("hidden");
    $(".media-overlay").addClass("visible");
}

function HideMediaGallery() {
    console.log("Hiding media gallery");

    $(".media-overlay").removeClass("visible");
    $(".media-overlay").addClass("hidden");

    $(".mobileSidebar").trigger( "click" );

    videoPlayer.pause();
}

$(".mobileSidebar").click(function(){
    if ($(this).parents('body').hasClass('openNav')) {
        $(this).parents('body').removeClass('openNav');
    } else {
        $(this).parents('body').addClass('openNav');
    }
});

var _PDF_DOC,
    _CURRENT_PAGE,
    _TOTAL_PAGES,
    _PAGE_RENDERING_IN_PROGRESS = 0,
    _CANVAS = document.querySelector('#pdf-canvas');

async function showPDF(pdf_url) {    
    try {
        _PDF_DOC = await pdfjsLib.getDocument({ url: pdf_url });
    }
    catch (error) {
        alert(error.message);
    }

    // total pages in pdf
    _TOTAL_PAGES = _PDF_DOC.numPages;

    // Hide the pdf loader and show pdf container
    document.querySelector("#pdf-contents").style.display = 'flex';
    document.querySelector("#pdf-total-pages").innerHTML = _TOTAL_PAGES;

    // show the first page
    showPage(1);
}

async function showPage(page_no) {
    _PAGE_RENDERING_IN_PROGRESS = 1;
    _CURRENT_PAGE = page_no;
    
    _CANVAS = document.querySelector('#pdf-canvas');
    
    // disable Previous & Next buttons while page is being loaded
    document.querySelector("#pdf-next").disabled = true;
    document.querySelector("#pdf-prev").disabled = true;

    // while page is being rendered hide the canvas and show a loading message
//    document.querySelector("#pdf-canvas").style.display = 'none';

    // update current page
    document.querySelector("#pdf-current-page").innerHTML = page_no;

    // get handle of page
    try {
        var page = await _PDF_DOC.getPage(page_no);
    }
    catch (error) {
        alert(error.message); 
    }

    // original width of the pdf page at scale 1
    var pdf_original_width = page.getViewport(1).width;
    var pdf_original_height = page.getViewport(1).height;
//    _CANVAS.width = pdf_original_width;

    // as the canvas is of a fixed width we need to adjust the scale of the viewport where page is rendered
    var scale_required;
    var scale_W = _CANVAS.width / pdf_original_width;
    var scale_H = _CANVAS.height / pdf_original_height;
    console.log("width:" + scale_W);
    console.log("width:" + scale_H);
//    var scale_required = 1;

    if (_CANVAS.width/_CANVAS.height > pdf_original_width/pdf_original_height){
        scale_required = scale_W;
    }
    else{
        scale_required = scale_H;
    }
    
    // get viewport to render the page at required scale
//    var viewport = page.getViewport(scale_required);
    var viewport = page.getViewport(1);

    // set canvas height same as viewport height
    _CANVAS.width = viewport.width;
    _CANVAS.height = viewport.height;

    // setting page loader height for smooth experience

    // page is rendered on <canvas> element
    var render_context = {
        canvasContext: _CANVAS.getContext('2d'),
        viewport: viewport
    };

    // render the page contents in the canvas
    try {
        await page.render(render_context);
    }
    catch (error) {
        alert(error.message);
    }

    _PAGE_RENDERING_IN_PROGRESS = 0;

    // re-enable Previous & Next buttons
    document.querySelector("#pdf-next").disabled = false;
    document.querySelector("#pdf-prev").disabled = false;

    // show the canvas and hide the page loader
//    document.querySelector("#pdf-canvas").style.display = 'block';
    
    console.log("Current page: " + _CURRENT_PAGE);
    
    $("#pdf-prev").css('opacity', 1);
    $("#pdf-next").css('opacity', 1);
    
    // If on the first page, hide previous button
    if (_CURRENT_PAGE == 1) {
        $("#pdf-prev").css('opacity', 0);
    }
    
    if (_CURRENT_PAGE == _TOTAL_PAGES) {
        $("#pdf-next").css('opacity', 0);
    }
}

// click on the "Previous" page button
document.querySelector("#pdf-prev").addEventListener('click', function () {
    if (_CURRENT_PAGE != 1)
        showPage(--_CURRENT_PAGE);
});

// click on the "Next" page button
document.querySelector("#pdf-next").addEventListener('click', function () {
    if (_CURRENT_PAGE != _TOTAL_PAGES)
        showPage(++_CURRENT_PAGE);
});

function LoadPdf(url) {
    $("#image-container").css("display", "none");
    $("#target-video").css("display", "none");
    $("#iframe-container").css("display", "none");
    $("#pdf-container").css("display", "block");
    $("#pptx-container").css("display", "none");

    showPDF(url);
}
